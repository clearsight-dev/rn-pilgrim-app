import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel } from 'apptile-core';
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';

export function ReactComponent({ model }) {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('Collection Products');
  const flatListRef = useRef(null);

  const fetchData = useCallback((cursor = null, isLoadingMore = false) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    fetchCollectionData(queryRunner, "hair-care", 50, cursor)
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
          setProducts(prevProducts => [...prevProducts, ...formattedProducts]);
        } else {
          // Replace products with new ones
          setProducts(formattedProducts);
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
  }, [shopifyDSModel]);

  useEffect(() => {
    if (shopifyDSModel) {
      fetchData(null);
    }
  }, [shopifyDSModel, fetchData]);

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
    paddingBottom: 16,
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
