import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ProductCountSkeleton, ProductGridSkeleton } from './Skeletons';
import { fetchFilteredProductsCount, getFilterAndProductsForCollection } from '../../../../extractedQueries/collectionqueries';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';
import ShadeSelector from '../../../../extractedQueries/ShadeSelector';
import VariantSelector from '../../../../extractedQueries/VariantSelector';
import { Image } from "../../../../extractedQueries/ImageComponent"
import { CollectionHeaderSkeleton } from '../../../../components/skeleton/collectionHeaderSkeleton';
import { RelatedProductCardSkeleton } from '../../../../components/skeleton/productCard'
import Header from '../../../../extractedQueries/CollectionFilterChips';
import Footer, { getShopifyFilters } from './Footer';
import styles from './styles';
import { colors, typography } from '../../../../extractedQueries/theme';

export function ReactComponent({ model }) {
  // const collectionHandle = model.get('collectionHandle') || '';
  const route = useRoute();
  const collectionHandle = route.params?.collectionHandle ?? 'bestsellers';
  const selectedCategory = route.params?.category;
  const selectedSubcategory = route.params?.subcategory;
  const shadeBottomSheetRef = useRef(null);
  const variantBottomSheetRef = useRef(null);
  const footerRef = useRef(null);
  // Product whose bottomsheet is opening
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [currentCursor, setCurrentCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [image, setImage] = useState(null);
  const [sortOption, setSortOption] = useState('BEST_SELLING');
  const [sortReverse, setSortReverse] = useState(false);
  const [filterData, setFilterData] = useState({ filters: [], unflattenedFilters: [] });
  const [appliedFilters, setAppliedFilters] = useState([]); // Track applied filters separately
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [isLoadingFilteredCount, setIsLoadingFilteredCount] = useState(false);
  const [isMaxFilteredCount, setIsMaxFilteredCount] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState({ isMaxCount: false, count: 0 });
  const [isLoadingTotalCount, setIsLoadingTotalCount] = useState(false);
  const flatListRef = useRef(null);

  const onSelectShade = (product) => {
    setSelectedProduct(product);
    shadeBottomSheetRef.current?.show();
  };

  // Handle Choose Variant button click
  const onSelectVariant = (product) => {
    setSelectedProduct(product);
    variantBottomSheetRef.current?.show();
  };

  // Sort options
  const sortOptions = [
    { label: 'Bestselling', value: 'BEST_SELLING', reverse: false },
    { label: 'Price: Low to High', value: 'PRICE', reverse: false },
    { label: 'Price: High to Low', value: 'PRICE', reverse: true },
    { label: 'What\'s new', value: 'CREATED', reverse: false }
  ];

  const handleSortOptionSelect = useCallback((option) => {
    setSortOption(option.value);
    setSortReverse(option.reverse);

    // Hide the sort bottom sheet
    if (footerRef.current) {
      footerRef.current.hideSortBottomSheet();
    }

    // Reload products with new sort option
    setProducts([]);
    setCurrentCursor(null);
    fetchData(collectionHandle, null, false, option.value, option.reverse);

    // Refresh the total count when sort option changes
    fetchTotalProductsCount(collectionHandle);
  }, [collectionHandle]);

  function fetchData(
    collectionHandle,
    cursor = null,
    isLoadingMore = false,
    sortKey = sortOption,
    reverse = sortReverse
  ) {
    const timeout = setTimeout(() => {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
    }, 100);

    getFilterAndProductsForCollection(collectionHandle,
      [],
      sortKey,
      reverse,
      cursor,
      isLoadingMore ? 20 : 12,
      cursor
    )
      .then(res => {
        clearTimeout(timeout);
        if (isLoadingMore) {
          setProducts(prevProducts => prevProducts.concat(res.products));
        } else {
          setProducts(res.products);
        }
        setHasNextPage(res.hasNextPage);
        setCurrentCursor(res.lastCursor);
        setCollectionTitle(res.title);
        setImage(res.image);
        setFilterData({
          filters: res.filters,
          unflattenedFilters: res.unflattenedFilters
        });
      })
      .catch(err => {
        console.error(err.toString());
      })
      .finally(() => {
        clearTimeout(timeout);
        if (isLoadingMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      });
  }

  // Function to fetch filtered products count
  async function fetchFilteredCount(collectionHandle, filters) {
    if (filters.length === 0) {
      setFilteredProductsCount(0);
      setIsMaxFilteredCount(false);
      return;
    }

    setIsLoadingFilteredCount(true);

    try {
      console.log("[AGENT] Fetching filtered count with filters:", filters);

      const result = await fetchFilteredProductsCount(collectionHandle, filters);
      console.log("[AGENT] Filtered count result:", result);

      setFilteredProductsCount(result.count);
      setIsMaxFilteredCount(result.isMaxCount);
    } catch (error) {
      console.error('Error fetching filtered products count:', error);
    } finally {
      setIsLoadingFilteredCount(false);
    }
  }

  // Function to fetch total products count
  async function fetchTotalProductsCount(collectionHandle) {
    const timeout = setTimeout(() => {
      setIsLoadingTotalCount(true);
    }, 100)

    try {
      // Fetch count with no filters
      const result = await fetchFilteredProductsCount(collectionHandle, []);
      clearTimeout(timeout);
      setTotalProductsCount(result);
    } catch (error) {
      console.error('Error fetching total products count:', error);
    } finally {
      clearTimeout(timeout);
      setIsLoadingTotalCount(false);
    }
  }

  // Function to apply filters
  const applyFilters = useCallback((filterIds) => {
    // Hide the filter bottom sheet
    if (footerRef.current) {
      footerRef.current.hideFilterBottomSheet();
    }

    // Set applied filters to the new selected filters
    setAppliedFilters(filterIds);

    // Reload products with selected filters
    setProducts([]);
    setCurrentCursor(null);

    // Fetch data with filters
    fetchDataWithFilters(collectionHandle, null, false, sortOption, sortReverse, filterIds, filterData);

    const shopifyFilters = getShopifyFilters(filterIds, filterData);
    // If no filters are applied, refresh the total count
    if (filterIds.length === 0) {
      fetchTotalProductsCount(collectionHandle);
    } else {
      fetchFilteredProductsCount(collectionHandle, shopifyFilters);
    }
  }, [collectionHandle, filterData, sortOption, sortReverse]);

  // Function to fetch data with filters
  function fetchDataWithFilters(
    collectionHandle,
    cursor = null,
    isLoadingMore = false,
    sortKey = "BEST_SELLING",
    reverse = false,
    filterIds = [],
    filterData
  ) {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    setAppliedFilters(filterIds);

    // double loop but only runs when user clicks a filter. Should be fine.
    const filtersById = new Map();
    for (let i = 0; i < filterData.filters.length; ++i) {
      filtersById.set(filterData.filters[i].id, filterData.filters[i]);
    }
    const filters = filterIds.map(filterId => {
      const filterToSend = filtersById.get(filterId);
      return JSON.parse(filterToSend.input);
    });

    fetchFilteredCount(collectionHandle, filters, filterData);
    getFilterAndProductsForCollection(
      collectionHandle,
      filters,
      sortKey,
      reverse,
      cursor,
      isLoadingMore ? 20 : 12,
    )
      .then((res) => {
        setProducts(prev => {
          if (isLoadingMore) {
            return prev.concat(res.products);
          } else {
            return res.products;
          }
        });
        setHasNextPage(res.hasNextPage);
        setCurrentCursor(res.lastCursor);
      })
      .catch(err => {
        console.error("Failed to fetch data for the applied filters: ", collectionHandle, err);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      })
  }

  useEffect(() => {
    if (Platform.OS === "android") {
      setTimeout(() => {
        fetchTotalProductsCount(collectionHandle);
        fetchData(collectionHandle, null, false, "COLLECTION_DEFAULT", false);
      }, 50);
    } else {
      fetchTotalProductsCount(collectionHandle);
      fetchData(collectionHandle, null, false, "COLLECTION_DEFAULT", false);
    }
  }, [collectionHandle]);

  // Handle loading more products when reaching the end of the list
  const handleLoadMore = (collectionHandle) => {
    if (hasNextPage && !loadingMore && !loading) {
      if (appliedFilters.length > 0) {
        // If filters are applied, use fetchDataWithFilters
        fetchDataWithFilters(
          collectionHandle,
          currentCursor,
          true,
          sortOption,
          sortReverse,
          appliedFilters,
          filterData.filters
        );
      } else {
        // Otherwise, use the regular fetchData
        fetchData(collectionHandle, currentCursor, true, sortOption, sortReverse);
      }
    }
  };

  // Render a product item in the grid
  const renderProductItem = ({ item, index }) => {
    if (loading) {
      return <RelatedProductCardSkeleton />
    }

    return (
      <RelatedProductCard
        product={item}
        style={styles.productCard}
        onSelectShade={onSelectShade}
        onSelectVariant={onSelectVariant}
      />)
  };

  // Render footer with loading indicator when loading more products
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.secondaryMain} />
        <Text style={[typography.family, styles.loadingMoreText]}>Loading more products...</Text>
      </View>
    );
  };

  const renderListHeader = () => {
    if (loading) return <CollectionHeaderSkeleton />;

    return (
      <>
        {image?.url && image?.width && image?.height && (
          <Image
            source={{ uri: image.url }}
            style={{
              aspectRatio: image.width / image.height,
            }}
          />
        )}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 0 }}>
          <Text style={[styles.title]}>{collectionTitle}</Text>
          <View style={styles.headerContainer}>
            {appliedFilters.length > 0 ? (
              isLoadingFilteredCount ? (
                <ProductCountSkeleton />
              ) : (
                <Text style={[typography.family, styles.productsCount]}>
                  {isMaxFilteredCount ? '90+ Products' : `${filteredProductsCount} Products`}
                </Text>
              )
            ) : (
              isLoadingTotalCount ? (
                <ProductCountSkeleton />
              ) : (
                <Text style={[typography.family, styles.productsCount]}>
                  {totalProductsCount.isMaxCount ? '90+ Products' : `${totalProductsCount.count} Products`}
                </Text>
              )
            )}
          </View>
        </View>
      </>
    );
  };


  const onFilterSelect = useCallback((filter) => {
    const newSelectedFilters = appliedFilters.concat(filter);
    fetchDataWithFilters(
      collectionHandle,
      null,
      false,
      sortOption,
      sortReverse,
      newSelectedFilters,
      filterData
    );
  }, [collectionHandle, sortReverse, sortOption, appliedFilters, filterData]);

  const onFilterRemove = useCallback((filter) => {
    const newSelectedFilters = appliedFilters.filter(id => id !== filter);
    fetchDataWithFilters(
      collectionHandle,
      null,
      false,
      sortOption,
      sortReverse,
      newSelectedFilters,
      filterData
    );
  }, [collectionHandle, sortReverse, sortOption, appliedFilters, filterData]);

  const onClearAllFilters = useCallback(() => {
    fetchDataWithFilters(
      collectionHandle,
      null,
      false,
      sortOption,
      sortReverse,
      [],
      filterData
    );
  }, [collectionHandle, sortOption, sortReverse]);

  return (
    <View style={[styles.container, { padding: 0 }]}>
      {/* Filter chips header */}
      {/* <Header 
        filterData={filterData.filters}
        appliedFilters={appliedFilters}
        onFilterRemove={onFilterRemove}
        onFilterSelect={onFilterSelect}
        onClearAllFilters={onClearAllFilters}
      /> */}

      <FlatList
        ref={flatListRef}
        data={loading ? Array(12).fill(0) : products}
        renderItem={renderProductItem}
        numColumns={2}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={() => handleLoadMore(collectionHandle)}
        onEndReachedThreshold={1.5} // Trigger when 30% from the end
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <Text style={[typography.family, styles.emptyText]}>No products found</Text>
        }
      />

      {!loading && <Footer
        ref={footerRef}
        sortOptions={sortOptions}
        collectionHandle={collectionHandle}
        handleSortOptionSelect={handleSortOptionSelect}
        sortOption={sortOption}
        sortReverse={sortReverse}
        filterData={filterData}
        applyFilters={applyFilters}
        totalProductsCount={totalProductsCount.count}
        isMaxTotalCount={totalProductsCount.isMaxCount}
        appliedFilters={appliedFilters}
      />}
      {/* Shade Selector Modal */}
      <ShadeSelector
        bottomSheetRef={shadeBottomSheetRef}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Variant Selector Modal */}
      <VariantSelector
        bottomSheetRef={variantBottomSheetRef}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
}

export const WidgetConfig = {
  collectionHandle: ''
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'collectionHandle',
      props: {
        label: 'Collection Handle'
      }
    }
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Collection Products Grid',
  defaultProps: {
  },
};
