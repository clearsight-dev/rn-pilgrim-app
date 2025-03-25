import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, Icon } from 'apptile-core';
import BottomSheet from '../../../../extractedQueries/BottomSheet';
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
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
  const flatListRef = useRef(null);
  const filterBottomSheetRef = useRef(null);
  const sortBottomSheetRef = useRef(null);
  
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

  // Handle loading more products when reaching the end of the list
  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore && !loading) {
      fetchData(currentCursor, true);
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
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3} // Trigger when 30% from the end
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
        title="Filter Options"
        sheetHeight={0.7}
      >
        <View style={styles.bottomSheetContent}>
          <Text>Filter options will be added here</Text>
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
