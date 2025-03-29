import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { datasourceTypeModelSel, Icon } from 'apptile-core';
import { ProductCountSkeleton,  ProductGridSkeleton } from './Skeletons';
import { fetchCollectionData, fetchFilteredProductsCount } from '../../../../extractedQueries/collectionqueries';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';
import Footer from './Footer';
import Header from './Header';
import styles from './styles';

export function ReactComponent({ model }) {
  // const collectionHandle = model.get('collectionHandle') || '';
  const route = useRoute();
  const collectionHandle = route.params?.collectionHandle ?? '3-redensyl-4-anagain-hair-growth-serum';
  const selectedCategory = route.params?.category;
  const selectedSubcategory = route.params?.subcategory;
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

  // Create initial filters based on selected category and subcategory
  const createInitialFilters = useCallback(() => {
    const initialFilters = [];
    
    // If we have a selected category, add it as a filter
    if (selectedCategory) {
      console.log(`[AGENT] Adding category filter: ${selectedCategory}`);
      
      // Find the filter ID for categories
      const categoryFilterId = filterData.find(f => 
        f.label?.toLowerCase() === 'category' || 
        f.label?.toLowerCase() === 'categories'
      )?.id;
      
      if (categoryFilterId) {
        // Find the value ID for this category
        const categoryFilter = filterData.find(f => f.id === categoryFilterId);
        const categoryValueId = categoryFilter?.values?.find(v => 
          v.label?.toLowerCase() === selectedCategory.toLowerCase()
        )?.id;
        
        if (categoryValueId) {
          initialFilters.push({
            id: categoryFilterId,
            values: [categoryValueId]
          });
        }
      }
    }
    
    // If we have a selected subcategory, add it as a filter
    if (selectedSubcategory) {
      console.log(`[AGENT] Adding subcategory filter: ${selectedSubcategory}`);
      
      // Find the filter ID for subcategories
      const subcategoryFilterId = filterData.find(f => 
        f.label?.toLowerCase() === 'subcategory' || 
        f.label?.toLowerCase() === 'subcategories' ||
        f.label?.toLowerCase() === 'type'
      )?.id;
      
      if (subcategoryFilterId) {
        // Find the value ID for this subcategory
        const subcategoryFilter = filterData.find(f => f.id === subcategoryFilterId);
        const subcategoryValueId = subcategoryFilter?.values?.find(v => 
          v.label?.toLowerCase() === selectedSubcategory.toLowerCase()
        )?.id;
        
        if (subcategoryValueId) {
          initialFilters.push({
            id: subcategoryFilterId,
            values: [subcategoryValueId]
          });
        }
      }
    }
    
    return initialFilters;
  }, [selectedCategory, selectedSubcategory, filterData]);

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
    
    fetchCollectionData(queryRunner, collectionHandle, 12, cursor, sortKey, reverse)
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
          
          // If we have selected category or subcategory, apply them as filters
          if ((selectedCategory || selectedSubcategory) && !isLoadingMore) {
            // We need to wait for filter data to be set before creating initial filters
            setTimeout(() => {
              const initialFilters = createInitialFilters();
              if (initialFilters.length > 0) {
                console.log('[AGENT] Applying initial filters:', initialFilters);
                applyFilters(initialFilters);
              }
            }, 500);
          }
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
  }, [collectionHandle, shopifyDSModel, sortOption, sortReverse, fetchFirstFourProductsPdpData, selectedCategory, selectedSubcategory, createInitialFilters]);

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
    
    if (!shopifyDSModel || selectedFilters.length === 0) {
      console.log("[AGENT] No filters or shopifyDSModel, setting count to 0");
      setFilteredProductsCount(0);
      setIsMaxFilteredCount(false);
      return;
    }
    
    setIsLoadingFilteredCount(true);
    
    try {
      const queryRunner = shopifyDSModel.get('queryRunner');
      const filters = getShopifyFilters();
      console.log("[AGENT] Fetching filtered count with filters:", filters);
      
      const result = await fetchFilteredProductsCount(queryRunner, collectionHandle, filters);
      console.log("[AGENT] Filtered count result:", result);
      
      setFilteredProductsCount(result.count);
      setIsMaxFilteredCount(result.isMaxCount);
    } catch (error) {
      console.error('Error fetching filtered products count:', error);
    } finally {
      setIsLoadingFilteredCount(false);
    }
  }, [shopifyDSModel, selectedFilters, getShopifyFilters, collectionHandle]);
  
  // Function to fetch total products count
  const fetchTotalProductsCount = useCallback(async () => {
    if (!shopifyDSModel) return;
    
    setIsLoadingTotalCount(true);
    
    try {
      const queryRunner = shopifyDSModel.get('queryRunner');
      // Fetch count with no filters
      const result = await fetchFilteredProductsCount(queryRunner, collectionHandle, []);
      
      setTotalProductsCount(result.count);
      setIsMaxTotalCount(result.isMaxCount);
    } catch (error) {
      console.error('Error fetching total products count:', error);
    } finally {
      setIsLoadingTotalCount(false);
    }
  }, [shopifyDSModel, collectionHandle]);
  
  // Function to apply filters
  const applyFilters = (newSelectedFilters) => {
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
    setPdpData({});
    
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
  };
  
  // Function to fetch data with filters
  const fetchDataWithFilters = useCallback((cursor = null, isLoadingMore = false, sortKey = sortOption, reverse = sortReverse, filters = []) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    fetchCollectionData(queryRunner, collectionHandle, 12, cursor, sortKey, reverse, filters)
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
  }, [collectionHandle, shopifyDSModel, sortOption, sortReverse, fetchFirstFourProductsPdpData]);

  // Update filtered products count when selected filters change
  useEffect(() => {
    console.log("[AGENT] selectedFilters changed, calling fetchFilteredCount");
    fetchFilteredCount();
  }, [selectedFilters, fetchFilteredCount]);
  
  // Fetch total products count when component loads
  useEffect(() => {
    if (shopifyDSModel) {
      fetchTotalProductsCount();
    }
  }, [shopifyDSModel, fetchTotalProductsCount]);

  useEffect(() => {
    if (shopifyDSModel) {
      fetchData(null);
    }
  }, [shopifyDSModel, fetchData, collectionHandle]);
  
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
  
  // Function to clear all filters
  const handleClearAllFilters = () => {
    // Clear all filters
    setSelectedFilters([]);
    setAppliedFilters([]);
    
    // Reload products with no filters
    setProducts([]);
    setCurrentCursor(null);
    setPdpData({});
    
    // Fetch data without filters
    fetchData(null, false, sortOption, sortReverse);
    
    // Refresh the total count
    fetchTotalProductsCount();
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
  const handleFilterRemove = (filterId, valueId) => {
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
        setPdpData({});
        
        // Get the Shopify filters format
        const shopifyFilters = getAppliedShopifyFilters();
        
        // Fetch data with updated filters
        fetchDataWithFilters(null, false, sortOption, sortReverse, shopifyFilters);
        
        // If no filters are applied, refresh the total count
        if (updatedFilters.length === 0) {
          fetchTotalProductsCount();
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              {isMaxTotalCount ? '90+ Products' : `${totalProductsCount} Products`}
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
          onEndReachedThreshold={0.5} // Trigger when 30% from the end
          // onViewableItemsChanged={handleViewableItemsChanged}
          // viewabilityConfig={{
          //   itemVisiblePercentThreshold: 50, // Item is considered visible when 50% of it is visible
          //   minimumViewTime: 300 // Item must be visible for at least 300ms
          // }}
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
        selectedFilters={selectedFilters}
        applyFilters={applyFilters}
        totalProductsCount={totalProductsCount}
        isMaxTotalCount={isMaxTotalCount}
      />
    </SafeAreaView>
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
