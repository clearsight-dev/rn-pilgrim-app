import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ProductCountSkeleton,  ProductGridSkeleton } from './Skeletons';
import { fetchCollectionData, fetchFilteredProductsCount } from '../../../../extractedQueries/collectionqueries';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';
import {formatProductsForCarousel} from '../../../../extractedQueries/RelatedProductsCarousel';
import ShadeSelector from '../../../../extractedQueries/ShadeSelector';
import VariantSelector from '../../../../extractedQueries/VariantSelector';
import Footer from './Footer';
import Header from './Header';
import styles from './styles';

export function ReactComponent({ model }) {
  // const collectionHandle = model.get('collectionHandle') || '';
  const route = useRoute();
  const shadeBottomSheetRef = useRef(null);
  const variantBottomSheetRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const collectionHandle = route.params?.collectionHandle ?? 'bestsellers';
  const selectedCategory = route.params?.category;
  const selectedSubcategory = route.params?.subcategory;
  const footerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('Collection Products');
  const [sortOption, setSortOption] = useState('BEST_SELLING');
  const [sortReverse, setSortReverse] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]); // Track applied filters separately
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [isLoadingFilteredCount, setIsLoadingFilteredCount] = useState(false);
  const [isMaxFilteredCount, setIsMaxFilteredCount] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState({isMaxCount: false, count: 0});
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
    fetchData(null, false, option.value, option.reverse);
    
    // Refresh the total count when sort option changes
    fetchTotalProductsCount();
  }, [collectionHandle]);

  const fetchData = useCallback((cursor = null, isLoadingMore = false, sortKey = sortOption, reverse = sortReverse) => {
    const timeout = setTimeout(() => {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
    }, 100);

    
    fetchCollectionData(collectionHandle, isLoadingMore ? 20 : 12, cursor, sortKey, reverse)
      .then(res => {
        clearTimeout(timeout);
        // Set collection title
        if (res.data.collection?.title) {
          setCollectionTitle(res.data.collection.title);
        }
        
        // Extract products from the collection data
        const productEdges = res.data.collection?.products?.edges || [];
        let unformattedProducts = [];
        for (let i = 0; i < productEdges.length; ++i) {
          unformattedProducts.push(productEdges[i].node);
        }

        const formattedProducts = formatProductsForCarousel(unformattedProducts);
        
        if (isLoadingMore) {
          // Append new products to existing ones
          setProducts(prevProducts => {
            const newProducts = [...prevProducts, ...formattedProducts];
            return newProducts;
          });
        } else {
          // Replace products with new ones
          setProducts(formattedProducts);
        }
        
        // Store filter data if available
        if (res.data.collection?.products?.filters) {
          setFilterData(res.data.collection.products.filters);
        }
        
        setHasNextPage(res.data.pagination.hasNextPage);
        setCurrentCursor(res.data.pagination.lastCursor);
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
  }, [collectionHandle, sortOption, sortReverse, selectedCategory, selectedSubcategory]);

  // Function to convert selected filters to Shopify filter format
  const getShopifyFilters = useCallback(() => {
    return selectedFilters.map(filter => {
      // Check if this is a metafield filter (contains 'p.m' in the ID)
      if (filter.id.includes('p.m')) {
        // Split the ID by dots
        const parts = filter.id.split('.');
        
        // For metafield filters, the format is typically:
        // filter.p.m.[namespace].[key].[value-identifier]
        // We need to extract the namespace and key
        if (parts.length >= 4) {
          const namespace = parts[parts.length - 2];
          const key = parts[parts.length - 1];
          
          // For metafield filters, we need to use the label as the value
          // and create a filter for each selected value
          return filter.values.map(valueId => {
            // Find the corresponding filter value object to get the label
            const filterDataItem = filterData.find(f => f.id === filter.id);
            const valueObj = filterDataItem?.values?.find(v => v.id === valueId);
            
            console.log(`Creating metafield filter: namespace=${namespace}, key=${key}, value=${valueObj?.label || valueId}`);
            
            return {
              productMetafield: {
                namespace,
                key,
                value: valueObj?.label || valueId
              }
            };
          });
        }
      }
      
      // Default case: use the standard product filter format
      return {
        productFilter: {
          filterType: filter.id,
          values: filter.values
        }
      };
    }).flat(); // Flatten the array since metafield filters might return arrays
  }, [selectedFilters, filterData]);
  
  // Function to convert applied filters to Shopify filter format
  const getAppliedShopifyFilters = useCallback(() => {
    return appliedFilters.map(filter => {
      // Check if this is a metafield filter (contains 'p.m' in the ID)
      if (filter.id.includes('p.m')) {
        // Split the ID by dots
        const parts = filter.id.split('.');
        
        // For metafield filters, the format is typically:
        // filter.p.m.[namespace].[key].[value-identifier]
        // We need to extract the namespace and key
        if (parts.length >= 4) {
          const namespace = parts[parts.length - 2];
          const key = parts[parts.length - 1];
          
          // For metafield filters, we need to use the label as the value
          // and create a filter for each selected value
          return filter.values.map(valueId => {
            // Find the corresponding filter value object to get the label
            const filterDataItem = filterData.find(f => f.id === filter.id);
            const valueObj = filterDataItem?.values?.find(v => v.id === valueId);
            
            console.log(`Creating metafield filter: namespace=${namespace}, key=${key}, value=${valueObj?.label || valueId}`);
            
            return {
              productMetafield: {
                namespace,
                key,
                value: valueObj?.label || valueId
              }
            };
          });
        }
      }
      
      // Default case: use the standard product filter format
      return {
        productFilter: {
          filterType: filter.id,
          values: filter.values
        }
      };
    }).flat(); // Flatten the array since metafield filters might return arrays
  }, [appliedFilters, filterData]);
  
  // Function to fetch filtered products count
  const fetchFilteredCount = useCallback(async () => {
    console.log("[AGENT] fetchFilteredCount called with selectedFilters:", selectedFilters);
    
    if (selectedFilters.length === 0) {
      console.log("[AGENT] No filters or shopifyDSModel, setting count to 0");
      setFilteredProductsCount(0);
      setIsMaxFilteredCount(false);
      return;
    }
    
    setIsLoadingFilteredCount(true);
    
    try {
      const filters = getShopifyFilters();
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
  }, [selectedFilters, getShopifyFilters, collectionHandle]);
  
  // Function to fetch total products count
  async function fetchTotalProductsCount(collectionHandle) {
    const timeout = setTimeout(() => {
      setIsLoadingTotalCount(true);
    }, 100)
    
    try {
      // Fetch count with no filters
      const result = await fetchFilteredProductsCount(collectionHandle, []);
      clearTimeout(timeout);
      console.log("Setting product count", result);
      setTotalProductsCount(result);
    } catch (error) {
      console.error('Error fetching total products count:', error);
    } finally {
      clearTimeout(timeout);
      setIsLoadingTotalCount(false);
    }
  }
  
  // Function to apply filters
  const applyFilters = useCallback((newSelectedFilters) => {
    // Hide the filter bottom sheet
    if (footerRef.current) {
      footerRef.current.hideFilterBottomSheet();
    }
    
    // Update the selected filters state with the new filters from the Footer component
    setSelectedFilters(newSelectedFilters);
    
    // Set applied filters to the new selected filters
    setAppliedFilters(newSelectedFilters);
    
    // Reload products with selected filters
    setProducts([]);
    setCurrentCursor(null);
    
    // Get the Shopify filters format based on the new selected filters
    const shopifyFilters = newSelectedFilters.map(filter => {
      // Check if this is a metafield filter (contains 'p.m' in the ID)
      if (filter.id.includes('p.m')) {
        // Split the ID by dots
        const parts = filter.id.split('.');
        
        // For metafield filters, the format is typically:
        // filter.p.m.[namespace].[key].[value-identifier]
        // We need to extract the namespace and key
        if (parts.length >= 4) {
          const namespace = parts[parts.length - 2];
          const key = parts[parts.length - 1];
          
          // For metafield filters, we need to use the label as the value
          // and create a filter for each selected value
          return filter.values.map(valueId => {
            // Find the corresponding filter value object to get the label
            const filterDataItem = filterData.find(f => f.id === filter.id);
            const valueObj = filterDataItem?.values?.find(v => v.id === valueId);
            
            return {
              productMetafield: {
                namespace,
                key,
                value: valueObj?.label || valueId
              }
            };
          });
        }
      }
      
      // Default case: use the standard product filter format
      return {
        productFilter: {
          filterType: filter.id,
          values: filter.values
        }
      };
    }).flat();
    
    // Fetch data with filters
    fetchDataWithFilters(null, false, sortOption, sortReverse, shopifyFilters);
    
    // If no filters are applied, refresh the total count
    if (newSelectedFilters.length === 0) {
      fetchTotalProductsCount();
    }
  }, [collectionHandle]);
  
  // Function to fetch data with filters
  const fetchDataWithFilters = useCallback((cursor = null, isLoadingMore = false, sortKey = sortOption, reverse = sortReverse, filters = []) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    fetchCollectionData(collectionHandle, isLoadingMore ? 20 : 12, cursor, sortKey, reverse, filters)
      .then(res => {
        // Set collection title
        if (res.data.collection?.title) {
          setCollectionTitle(res.data.collection.title);
        }
        
        // Extract products from the collection data
        const productEdges = res.data.collection?.products?.edges || [];
        const formattedProducts = productEdges.map(edge => {
          // Find the rating metafield
          const ratingMetafield = edge.node.metafields?.find(m => m?.key === 'rating');
          
          // Parse the rating JSON string if it exists
          let rating = '4.5'; // Default rating
          if (ratingMetafield?.value) {
            try {
              // Parse the JSON string to get the rating object
              const ratingData = JSON.parse(ratingMetafield.value);
              // Extract the actual rating value (assuming it's under a 'value' key)
              if (ratingData && ratingData.value) {
                rating = parseFloat(ratingData.value).toFixed(1);
              }
            } catch (error) {
              console.error('Error parsing rating JSON:', error);
            }
          }
          
          return {
            handle: edge.node.handle,
            title: edge.node.title,
            description: edge.node.description,
            featuredImage: edge.node.featuredImage,
            priceRange: edge.node.priceRange,
            compareAtPriceRange: edge.node.compareAtPriceRange,
            metafield: edge.node.metafields?.find(m => m?.key === 'product_label_1'),
            availableForSale: edge.node.availableForSale,
            rating: rating
          };
        });
        
        if (isLoadingMore) {
          // Append new products to existing ones
          setProducts(prevProducts => {
            const newProducts = [...prevProducts, ...formattedProducts];
            return newProducts;
          });
        } else {
          // Replace products with new ones
          setProducts(formattedProducts);
        }
        
        // Store filter data if available
        if (res.data.collection?.products?.filters) {
          setFilterData(res.data.collection.products.filters);
        }
        
        setHasNextPage(res.data.pagination.hasNextPage);
        setCurrentCursor(res.data.pagination.lastCursor);
      })
      .catch(err => {
        console.error(err.toString());
      })
      .finally(() => {
        if (isLoadingMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      });
  }, [collectionHandle, sortOption, sortReverse]);

  // Update filtered products count when selected filters change
  useEffect(() => {
    console.log("[AGENT] selectedFilters changed, calling fetchFilteredCount");
    fetchFilteredCount();
  }, [selectedFilters, fetchFilteredCount]);
  
  useEffect(() => {
    if (Platform.OS === "android") {
      setTimeout(() => {
        fetchTotalProductsCount(collectionHandle);
        fetchData(null);
      }, 50);
    } else {
      fetchTotalProductsCount(collectionHandle);
      fetchData(null);
    }
  }, [collectionHandle]);
  
  // Handle loading more products when reaching the end of the list
  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore && !loading) {
      if (appliedFilters.length > 0) {
        // If filters are applied, use fetchDataWithFilters
        const shopifyFilters = getAppliedShopifyFilters();
        fetchDataWithFilters(currentCursor, true, sortOption, sortReverse, shopifyFilters);
      } else {
        // Otherwise, use the regular fetchData
        fetchData(currentCursor, true);
      }
    }
  };

  // Render a product item in the grid
  const renderProductItem = ({ item, index }) => (
    <RelatedProductCard 
      product={item}
      style={styles.productCard}
      onSelectShade={onSelectShade}
      onSelectVariant={onSelectVariant}
    />
  );

  // Render footer with loading indicator when loading more products
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.loadingMoreText}>Loading more products...</Text>
      </View>
    );
  };
  
  // Function to clear all filters
  const handleClearAllFilters = () => {
    // Clear all filters
    setSelectedFilters([]);
    setAppliedFilters([]);
    
    // Reload products with no filters
    setProducts([]);
    setCurrentCursor(null);
    
    // Fetch data without filters
    fetchData(null, false, sortOption, sortReverse);
    
    // Refresh the total count
    fetchTotalProductsCount(collectionHandle);
  };
  
  // Function to handle selecting a filter from the header chips
  const handleFilterSelect = (filterId, valueId) => {
    // Create a copy of the current applied filters
    const updatedFilters = [...appliedFilters];
    
    // Check if this filter type already exists in the selected filters
    const existingFilterIndex = updatedFilters.findIndex(f => f.id === filterId);
    
    if (existingFilterIndex >= 0) {
      // Filter exists, check if this value is already selected
      const existingFilter = updatedFilters[existingFilterIndex];
      if (!existingFilter.values.includes(valueId)) {
        // Add this value to the existing filter
        updatedFilters[existingFilterIndex] = {
          ...existingFilter,
          values: [...existingFilter.values, valueId]
        };
      }
    } else {
      // Filter doesn't exist, add it with the selected value
      updatedFilters.push({
        id: filterId,
        values: [valueId]
      });
    }
    
    // Apply the updated filters
    applyFilters(updatedFilters);
  };
  
  // Function to handle removing a filter from the header chips
  const handleFilterRemove = useCallback((filterId, valueId) => {
    // Create a copy of the current applied filters
    const updatedFilters = [...appliedFilters];
    
    // Find the filter in the array
    const filterIndex = updatedFilters.findIndex(f => f.id === filterId);
    
    if (filterIndex >= 0) {
      const filter = updatedFilters[filterIndex];
      
      // Remove the value from the filter's values array
      const valueIndex = filter.values.indexOf(valueId);
      if (valueIndex >= 0) {
        const newValues = [...filter.values];
        newValues.splice(valueIndex, 1);
        
        // If no values left, remove the filter entirely
        if (newValues.length === 0) {
          updatedFilters.splice(filterIndex, 1);
        } else {
          // Otherwise update the filter with the new values
          updatedFilters[filterIndex] = {
            ...filter,
            values: newValues
          };
        }
        
        // Update the selected filters state
        setSelectedFilters(updatedFilters);
        
        // Update the applied filters
        setAppliedFilters(updatedFilters);
        
        // Reload products with updated filters
        setProducts([]);
        setCurrentCursor(null);
        
        // Get the Shopify filters format
        const shopifyFilters = getAppliedShopifyFilters();
        
        // Fetch data with updated filters
        fetchDataWithFilters(null, false, sortOption, sortReverse, shopifyFilters);
        
        // If no filters are applied, refresh the total count
        if (updatedFilters.length === 0) {
          fetchTotalProductsCount(collectionHandle);
        }
      }
    }
  }, [collectionHandle]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{collectionTitle}</Text>
      
      <View style={styles.headerContainer}>
        {appliedFilters.length > 0 ? (
          // Show filtered count when filters are applied
          isLoadingFilteredCount ? (
            <ProductCountSkeleton />
          ) : (
            <Text style={styles.productsCount}>
              {isMaxFilteredCount ? '90+ Products' : `${filteredProductsCount} Products`}
            </Text>
          )
        ) : (
          // Show total count when no filters are applied
          isLoadingTotalCount ? (
            <ProductCountSkeleton />
          ) : (
            <Text style={styles.productsCount}>
              {totalProductsCount.isMaxCount ? '90+ Products' : `${totalProductsCount.count} Products`}
            </Text>
          )
        )}
      </View>
      
      {/* Filter chips header */}
      <Header 
        filterData={filterData}
        selectedFilters={appliedFilters}
        onFilterRemove={handleFilterRemove}
        onFilterSelect={handleFilterSelect}
        onClearAllFilters={handleClearAllFilters}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ProductGridSkeleton />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item.handle || `product-${index}`}
          numColumns={2}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1.5} // Trigger when 30% from the end
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
      )}
      
      <Footer 
        ref={footerRef}
        sortOptions={sortOptions}
        collectionHandle={collectionHandle}
        handleSortOptionSelect={handleSortOptionSelect}
        sortOption={sortOption}
        sortReverse={sortReverse}
        filterData={filterData}
        selectedFilters={selectedFilters}
        applyFilters={applyFilters}
        totalProductsCount={totalProductsCount.count}
        isMaxTotalCount={totalProductsCount.isMaxCount}
      />
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
        optionName={"Size"}
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
