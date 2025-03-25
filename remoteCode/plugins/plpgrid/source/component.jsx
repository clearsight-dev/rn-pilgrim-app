import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, Icon } from 'apptile-core';
import BottomSheet from '../../../../extractedQueries/BottomSheet';
import { fetchCollectionData, fetchFilteredProductsCount } from '../../../../extractedQueries/collectionqueries';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';

export function ReactComponent({ model }) {
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
  const [activeFilterTab, setActiveFilterTab] = useState(0);
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [isLoadingFilteredCount, setIsLoadingFilteredCount] = useState(false);
  const [isMaxFilteredCount, setIsMaxFilteredCount] = useState(false);
  const flatListRef = useRef(null);
  const filterBottomSheetRef = useRef(null);
  const sortBottomSheetRef = useRef(null);
  const currentlyVisibleItems = useRef([]);
  const visibleItemsTimeoutRef = useRef(null);
  
  // Sort options
  const sortOptions = [
    { label: 'Bestselling', value: 'BEST_SELLING', reverse: false },
    { label: 'Price: Low to High', value: 'PRICE', reverse: false },
    { label: 'Price: High to Low', value: 'PRICE', reverse: true },
    { label: 'What\'s new', value: 'CREATED', reverse: false }
  ];
  
  const openFilterBottomSheet = () => {
    if (filterBottomSheetRef.current) {
      filterBottomSheetRef.current.show();
    }
  };
  
  const openSortBottomSheet = () => {
    if (sortBottomSheetRef.current) {
      sortBottomSheetRef.current.show();
    }
  };

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
    if (sortBottomSheetRef.current) {
      sortBottomSheetRef.current.hide();
    }
    
    // Reload products with new sort option
    setProducts([]);
    setCurrentCursor(null);
    setPdpData({});
    fetchData(null, false, option.value, option.reverse);
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
      if (selectedFilters.length > 0) {
        // If filters are applied, use fetchDataWithFilters
        const shopifyFilters = getShopifyFilters();
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
      // Split the ID by dots
      const parts = filter.id.split('.');
      
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
      
      // Default case: use the standard product filter format
      return {
        productFilter: {
          filterType: filter.id,
          values: filter.values
        }
      };
    }).flat(); // Flatten the array since metafield filters might return arrays
  }, [selectedFilters, filterData]);
  
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
  
  // Update filtered products count when selected filters change
  useEffect(() => {
    fetchFilteredCount();
  }, [selectedFilters, fetchFilteredCount]);
  
  // Function to apply filters and close the bottom sheet
  const applyFilters = () => {
    if (filterBottomSheetRef.current) {
      filterBottomSheetRef.current.hide();
    }
    
    // Reload products with selected filters
    setProducts([]);
    setCurrentCursor(null);
    setPdpData({});
    
    // Get the Shopify filters format
    const shopifyFilters = getShopifyFilters();
    
    // Fetch data with filters
    fetchDataWithFilters(null, false, sortOption, sortReverse, shopifyFilters);
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
  
  // Render filter category tab
  const renderFilterTab = (filter, index) => {
    const isActive = activeFilterTab === index;
    
    return (
      <TouchableOpacity
        key={`filter-tab-${index}`}
        style={[styles.filterTab, isActive && styles.activeFilterTab]}
        onPress={() => setActiveFilterTab(index)}
      >
        <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
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
  
  // Render sort option item
  const renderSortOption = (option, index) => {
    const isSelected = sortOption === option.value && sortReverse === option.reverse;
    
    return (
      <TouchableOpacity
        key={`sort-option-${index}`}
        style={[styles.sortOptionItem, isSelected && styles.selectedSortOption]}
        onPress={() => handleSortOptionSelect(option)}
      >
        <Text style={[styles.sortOptionText, isSelected && styles.selectedSortOptionText]}>
          {option.label}
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
        <Text style={styles.productsCount}>{products.length} Products</Text>
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
      
      {/* Bottom buttons for sort and filter */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={openSortBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'sort'} 
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Sort</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={openFilterBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'filter-list'} 
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom sheets */}
      <BottomSheet 
        ref={filterBottomSheetRef}
        title="Filter"
        sheetHeight={0.7}
      >
        <View style={styles.filterBottomSheetContent}>
          {/* Filter tabs */}
          <View style={styles.filterTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filterData.map(renderFilterTab)}
            </ScrollView>
          </View>
          
          {/* Filter values */}
          <View style={styles.filterValuesContainer}>
            {filterData.length > 0 && activeFilterTab < filterData.length && (
              <FlatList
                data={filterData[activeFilterTab].values}
                renderItem={({ item }) => renderFilterValue(filterData[activeFilterTab], item)}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
          
          {/* Bottom action bar */}
          <View style={styles.filterActionBar}>
            <View style={styles.filterCountContainer}>
              {isLoadingFilteredCount ? (
                <ActivityIndicator size="small" color="#007bff" />
              ) : (
                <Text style={styles.filterCountText}>
                  {selectedFilters.length > 0 ? (
                    isMaxFilteredCount ? 
                    '90+ Products' : 
                    `${filteredProductsCount} Products`
                  ) : ''}
                </Text>
              )}
            </View>
            
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearAllFilters}
                disabled={selectedFilters.length === 0}
              >
                <Text style={[
                  styles.clearButtonText, 
                  selectedFilters.length === 0 && styles.disabledButtonText
                ]}>
                  Clear All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.applyButton,
                  selectedFilters.length === 0 && styles.disabledButton
                ]}
                onPress={applyFilters}
                disabled={selectedFilters.length === 0}
              >
                <Text style={[
                  styles.applyButtonText,
                  selectedFilters.length === 0 && styles.disabledButtonText
                ]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BottomSheet>
      
      <BottomSheet 
        ref={sortBottomSheetRef}
        title="Sort By"
        sheetHeight={0.5}
      >
        <View style={styles.bottomSheetContent}>
          {sortOptions.map(renderSortOption)}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsCount: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 14,
    marginLeft: 8,
  },
  gridContainer: {
    paddingBottom: 80, // Add padding to account for bottom buttons
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    marginRight: 0,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
    color: '#666',
  },
  // Bottom buttons styles
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonIcon: {
    marginRight: 8,
    fontSize: 20,
    color: '#1A1A1A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  // Bottom sheet content styles
  bottomSheetContent: {
    padding: 16,
    flex: 1,
  },
  // Sort options styles
  sortOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedSortOption: {
    backgroundColor: '#f8f8f8',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSortOptionText: {
    fontWeight: '600',
    color: '#000',
  },
  checkIcon: {
    fontSize: 20,
    color: '#007bff',
  },
  // Filter bottom sheet styles
  filterBottomSheetContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  activeFilterTab: {
    backgroundColor: '#1A1A1A',
  },
  filterTabText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterTabText: {
    color: '#fff',
    fontWeight: '500',
  },
  filterValuesContainer: {
    flex: 1,
    padding: 16,
  },
  filterValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilterValue: {
    backgroundColor: '#f8f8f8',
  },
  filterValueText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterValueText: {
    fontWeight: '600',
    color: '#000',
  },
  filterActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterCountContainer: {
    flex: 1,
  },
  filterCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#888',
  },
});

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
