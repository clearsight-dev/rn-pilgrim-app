import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, Icon } from 'apptile-core';
import { fetchCollectionData, fetchFilteredProductsCount } from '../../../../extractedQueries/collectionqueries';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';
import Footer from './Footer';
import styles from './styles';

export function ReactComponent({ model }) {
  const footerRef = useRef(null);
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('Collection Products');
  const [sortOption, setSortOption] = useState('BEST_SELLING');
  const [sortReverse, setSortReverse] = useState(false);
  const [pdpData, setPdpData] = useState({});
  const [loadingPdpData, setLoadingPdpData] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]); // Track applied filters separately
  const [activeFilterTab, setActiveFilterTab] = useState(0);
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [isLoadingFilteredCount, setIsLoadingFilteredCount] = useState(false);
  const [isMaxFilteredCount, setIsMaxFilteredCount] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [isLoadingTotalCount, setIsLoadingTotalCount] = useState(false);
  const [isMaxTotalCount, setIsMaxTotalCount] = useState(false);
  const flatListRef = useRef(null);
  const currentlyVisibleItems = useRef([]);
  const visibleItemsTimeoutRef = useRef(null);
  
  // Sort options
  const sortOptions = [
    { label: 'Bestselling', value: 'BEST_SELLING', reverse: false },
    { label: 'Price: Low to High', value: 'PRICE', reverse: false },
    { label: 'Price: High to Low', value: 'PRICE', reverse: true },
    { label: 'What\'s new', value: 'CREATED', reverse: false }
  ];

  // Function to fetch PDP data for a specific product handle
  const fetchProductPdpData = useCallback(async (productHandle) => {
    if (!shopifyDSModel) return;
    
    const queryRunner = shopifyDSModel.get('queryRunner');
    try {
      const result = await fetchProductData(queryRunner, productHandle);
      return result.data;
    } catch (error) {
      console.error(`Error fetching PDP data for ${productHandle}:`, error);
      return null;
    }
  }, [shopifyDSModel]);
  
  // Function to fetch PDP data for the first 4 products
  const fetchFirstFourProductsPdpData = useCallback(async (productsList) => {
    if (!productsList || productsList.length === 0) return;
    
    setLoadingPdpData(true);
    
    try {
      // Get the first 4 products (or fewer if there are less than 4)
      const firstFourProducts = productsList.slice(0, 4);
      
      // Create an object to store the PDP data
      const pdpDataObj = {};
      
      // Fetch PDP data for each product
      await Promise.all(
        firstFourProducts.map(async (product) => {
          const data = await fetchProductPdpData(product.handle);
          if (data) {
            pdpDataObj[product.handle] = data;
          }
        })
      );
      
      // Update the PDP data state
      setPdpData(pdpDataObj);
      console.log('Fetched PDP data for first 4 products:', Object.keys(pdpDataObj));
    } catch (error) {
      console.error('Error fetching PDP data for first 4 products:', error);
    } finally {
      setLoadingPdpData(false);
    }
  }, [fetchProductPdpData]);

  const handleSortOptionSelect = (option) => {
    setSortOption(option.value);
    setSortReverse(option.reverse);
    
    // Hide the sort bottom sheet
    if (footerRef.current) {
      footerRef.current.hideSortBottomSheet();
    }
    
    // Reload products with new sort option
    setProducts([]);
    setCurrentCursor(null);
    setPdpData({});
    fetchData(null, false, option.value, option.reverse);
    
    // Refresh the total count when sort option changes
    fetchTotalProductsCount();
  };

  const fetchData = useCallback((cursor = null, isLoadingMore = false, sortKey = sortOption, reverse = sortReverse) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    fetchCollectionData(queryRunner, "hair-care", 12, cursor, sortKey, reverse)
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
          
          // Fetch PDP data for the first 4 products
          if (formattedProducts.length > 0 && !isLoadingMore) {
            fetchFirstFourProductsPdpData(formattedProducts);
          }
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
  }, [shopifyDSModel, sortOption, sortReverse, fetchFirstFourProductsPdpData]);

  useEffect(() => {
    if (shopifyDSModel) {
      fetchData(null);
    }
  }, [shopifyDSModel, fetchData]);
  
  // Log when PDP data is loaded
  useEffect(() => {
    if (Object.keys(pdpData).length > 0) {
      console.log('PDP data loaded for products:', Object.keys(pdpData));
    }
  }, [pdpData]);

  // Function to process visible items and fetch PDP data
  const processVisibleItems = useCallback(() => {
    if (!products || products.length === 0 || loadingPdpData) return;
    
    // Get the handles of currently visible products
    const visibleHandles = currentlyVisibleItems.current;
    
    if (visibleHandles.length === 0) return;
    
    // Get the products that are currently visible
    const visibleProducts = products.filter(product => 
      product && product.handle && visibleHandles.includes(product.handle)
    );
    
    if (visibleProducts.length === 0) return;
    
    // Filter out products that already have PDP data
    const productsToFetch = visibleProducts.filter(product => !pdpData[product.handle]);
    
    if (productsToFetch.length === 0) return;
    
    console.log('Fetching PDP data for visible products:', productsToFetch.map(p => p.handle));
    setLoadingPdpData(true);
    
    // Create an object to store the PDP data
    const newPdpDataObj = { ...pdpData };
    
    // Fetch PDP data for each product
    Promise.all(
      productsToFetch.map(async (product) => {
        try {
          const data = await fetchProductPdpData(product.handle);
          if (data) {
            newPdpDataObj[product.handle] = data;
          }
        } catch (error) {
          console.error(`Error fetching PDP data for ${product.handle}:`, error);
        }
      })
    )
    .then(() => {
      // Update the PDP data state
      setPdpData(newPdpDataObj);
      console.log('Fetched PDP data for visible products:', productsToFetch.map(p => p.handle));
    })
    .catch(error => {
      console.error('Error fetching PDP data for visible products:', error);
    })
    .finally(() => {
      setLoadingPdpData(false);
    });
  }, [products, pdpData, loadingPdpData, fetchProductPdpData]);
  
  // Create a stable reference to the viewable items handler
  const stableViewableItemsHandler = useRef(null);
  
  // Initialize the stable handler
  useEffect(() => {
    stableViewableItemsHandler.current = ({ viewableItems }) => {
      if (viewableItems.length === 0) return;
      
      // Update the list of currently visible items
      currentlyVisibleItems.current = viewableItems
        .map(viewableItem => viewableItem.item?.handle)
        .filter(Boolean);
      
      // Clear any existing timeout
      if (visibleItemsTimeoutRef.current) {
        clearTimeout(visibleItemsTimeoutRef.current);
      }
      
      // Schedule a new timeout to process visible items
      visibleItemsTimeoutRef.current = setTimeout(() => {
        processVisibleItems();
      }, 2000); // 2 seconds debounce
    };
  }, [processVisibleItems]);
  
  // Stable wrapper function that doesn't change on re-renders
  const handleViewableItemsChanged = useCallback(info => {
    if (stableViewableItemsHandler.current) {
      stableViewableItemsHandler.current(info);
    }
  }, []);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (visibleItemsTimeoutRef.current) {
        clearTimeout(visibleItemsTimeoutRef.current);
      }
    };
  }, []);
  
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

  // Function to handle filter selection
  const handleFilterSelect = useCallback((filterId, valueId) => {
    setSelectedFilters(prev => {
      // Check if this filter is already selected
      const existingFilterIndex = prev.findIndex(f => f.id === filterId);
      
      if (existingFilterIndex >= 0) {
        // Filter exists, check if value is already selected
        const existingFilter = prev[existingFilterIndex];
        const valueIndex = existingFilter.values.indexOf(valueId);
        
        if (valueIndex >= 0) {
          // Value exists, remove it
          const newValues = [...existingFilter.values];
          newValues.splice(valueIndex, 1);
          
          // If no values left, remove the filter
          if (newValues.length === 0) {
            const newFilters = [...prev];
            newFilters.splice(existingFilterIndex, 1);
            return newFilters;
          } else {
            // Update the filter with new values
            const newFilters = [...prev];
            newFilters[existingFilterIndex] = {
              ...existingFilter,
              values: newValues
            };
            return newFilters;
          }
        } else {
          // Value doesn't exist, add it
          const newFilters = [...prev];
          newFilters[existingFilterIndex] = {
            ...existingFilter,
            values: [...existingFilter.values, valueId]
          };
          return newFilters;
        }
      } else {
        // Filter doesn't exist, add it with the value
        return [...prev, { id: filterId, values: [valueId] }];
      }
    });
  }, []);
  
  // Function to check if a filter value is selected
  const isFilterValueSelected = useCallback((filterId, valueId) => {
    const filter = selectedFilters.find(f => f.id === filterId);
    return filter ? filter.values.includes(valueId) : false;
  }, [selectedFilters]);
  
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
    if (!shopifyDSModel || selectedFilters.length === 0) {
      setFilteredProductsCount(0);
      setIsMaxFilteredCount(false);
      return;
    }
    
    setIsLoadingFilteredCount(true);
    
    try {
      const queryRunner = shopifyDSModel.get('queryRunner');
      const filters = getShopifyFilters();
      
      const result = await fetchFilteredProductsCount(queryRunner, "hair-care", filters);
      
      setFilteredProductsCount(result.count);
      setIsMaxFilteredCount(result.isMaxCount);
    } catch (error) {
      console.error('Error fetching filtered products count:', error);
    } finally {
      setIsLoadingFilteredCount(false);
    }
  }, [shopifyDSModel, selectedFilters, getShopifyFilters]);
  
  // Function to fetch total products count
  const fetchTotalProductsCount = useCallback(async () => {
    if (!shopifyDSModel) return;
    
    setIsLoadingTotalCount(true);
    
    try {
      const queryRunner = shopifyDSModel.get('queryRunner');
      // Fetch count with no filters
      const result = await fetchFilteredProductsCount(queryRunner, "hair-care", []);
      
      setTotalProductsCount(result.count);
      setIsMaxTotalCount(result.isMaxCount);
    } catch (error) {
      console.error('Error fetching total products count:', error);
    } finally {
      setIsLoadingTotalCount(false);
    }
  }, [shopifyDSModel]);
  
  // Update filtered products count when selected filters change
  useEffect(() => {
    fetchFilteredCount();
  }, [selectedFilters, fetchFilteredCount]);
  
  // Fetch total products count when component loads
  useEffect(() => {
    if (shopifyDSModel) {
      fetchTotalProductsCount();
    }
  }, [shopifyDSModel, fetchTotalProductsCount]);
  
  // Function to apply filters
  const applyFilters = () => {
    // Hide the filter bottom sheet
    if (footerRef.current) {
      footerRef.current.hideFilterBottomSheet();
    }
    
    // Set applied filters to current selected filters
    setAppliedFilters([...selectedFilters]);
    
    // Reload products with selected filters
    setProducts([]);
    setCurrentCursor(null);
    setPdpData({});
    
    // Get the Shopify filters format
    const shopifyFilters = getShopifyFilters();
    
    // Fetch data with filters
    fetchDataWithFilters(null, false, sortOption, sortReverse, shopifyFilters);
    
    // If no filters are applied, refresh the total count
    if (selectedFilters.length === 0) {
      fetchTotalProductsCount();
    }
  };
  
  // Function to fetch data with filters
  const fetchDataWithFilters = useCallback((cursor = null, isLoadingMore = false, sortKey = sortOption, reverse = sortReverse, filters = []) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    fetchCollectionData(queryRunner, "hair-care", 12, cursor, sortKey, reverse, filters)
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
          
          // Fetch PDP data for the first 4 products
          if (formattedProducts.length > 0 && !isLoadingMore) {
            fetchFirstFourProductsPdpData(formattedProducts);
          }
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
  }, [shopifyDSModel, sortOption, sortReverse, fetchFirstFourProductsPdpData]);
  
  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedFilters([]);
  };
  
  // Render filter value item
  const renderFilterValue = (filter, value) => {
    const isSelected = isFilterValueSelected(filter.id, value.id);
    
    return (
      <TouchableOpacity
        key={`filter-value-${value.id}`}
        style={[styles.filterValueItem, isSelected && styles.selectedFilterValue]}
        onPress={() => handleFilterSelect(filter.id, value.id)}
      >
        <Text style={[styles.filterValueText, isSelected && styles.selectedFilterValueText]}>
          {value.label}
        </Text>
        {isSelected && (
          <Icon 
            iconType={'Material Icon'} 
            name={'check'} 
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{collectionTitle}</Text>
      
      <View style={styles.headerContainer}>
        {appliedFilters.length > 0 ? (
          // Show filtered count when filters are applied
          isLoadingFilteredCount ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Text style={styles.productsCount}>
              {isMaxFilteredCount ? '90+ Products' : `${filteredProductsCount} Products`}
            </Text>
          )
        ) : (
          // Show total count when no filters are applied
          isLoadingTotalCount ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Text style={styles.productsCount}>
              {isMaxTotalCount ? '90+ Products' : `${totalProductsCount} Products`}
            </Text>
          )
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loading}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item.handle || `product-${index}`}
          numColumns={2}
          initialNumToRender={4}
          maxToRenderPerBatch={8}
          windowSize={5}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3} // Trigger when 30% from the end
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50, // Item is considered visible when 50% of it is visible
            minimumViewTime: 300 // Item must be visible for at least 300ms
          }}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
      )}
      
      <Footer 
        ref={footerRef}
        sortOptions={sortOptions}
        handleSortOptionSelect={handleSortOptionSelect}
        sortOption={sortOption}
        sortReverse={sortReverse}
        filterData={filterData}
        activeFilterTab={activeFilterTab}
        setActiveFilterTab={setActiveFilterTab}
        renderFilterValue={renderFilterValue}
        isLoadingFilteredCount={isLoadingFilteredCount}
        selectedFilters={selectedFilters}
        filteredProductsCount={filteredProductsCount}
        isMaxFilteredCount={isMaxFilteredCount}
        clearAllFilters={clearAllFilters}
        applyFilters={applyFilters}
      />
    </View>
  );
}

export const WidgetConfig = {
};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Collection Products Grid',
  defaultProps: {
  },
};
