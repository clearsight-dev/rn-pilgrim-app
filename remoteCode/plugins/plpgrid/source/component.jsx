import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel } from 'apptile-core';
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import RelatedProductCard from '../../../../extractedQueries/RelatedProductCard';

export function ReactComponent({ model }) {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [cursors, setCursors] = useState([]); // Store cursors for previous pages

  const fetchData = useCallback((cursor = null) => {
    setLoading(true);
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    fetchCollectionData(queryRunner, "hair-care", 10, cursor)
      .then(res => {
        setData(res);
        
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
        
        setProducts(formattedProducts);
        setHasNextPage(res.data.pagination.hasNextPage);
        setHasPreviousPage(res.data.pagination.hasPreviousPage || cursors.length > 0);
        setCurrentCursor(res.data.pagination.lastCursor);
      })
      .catch(err => {
        console.error(err.toString());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shopifyDSModel, cursors]);

  useEffect(() => {
    if (shopifyDSModel) {
      fetchData(null);
    }
  }, [shopifyDSModel, fetchData]);

  const handleNextPage = () => {
    if (hasNextPage) {
      // Store current cursor for going back
      setCursors(prev => [...prev, currentCursor]);
      fetchData(currentCursor);
      setPageNumber(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      // Get the previous cursor
      const newCursors = [...cursors];
      const prevCursor = newCursors.length > 1 ? newCursors[newCursors.length - 2] : null;
      
      // Remove the last cursor
      newCursors.pop();
      setCursors(newCursors);
      
      // Fetch with the previous cursor
      fetchData(prevCursor);
      setPageNumber(prev => prev - 1);
    }
  };

  // Render a product item in the grid
  const renderProductItem = ({ item, index }) => (
    <RelatedProductCard 
      product={item}
      style={styles.productCard}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collection Products</Text>
      
      <View style={styles.headerContainer}>
        <Text style={styles.pageInfo}>Page {pageNumber}</Text>
        
        <View style={styles.paginationContainer}>
          <TouchableOpacity 
            style={[styles.button, !hasPreviousPage && styles.disabledButton]} 
            onPress={handlePreviousPage}
            disabled={!hasPreviousPage}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, !hasNextPage && styles.disabledButton]} 
            onPress={handleNextPage}
            disabled={!hasNextPage}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item.handle || `product-${index}`}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageInfo: {
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
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
  name: 'Rating Summary Card',
  defaultProps: {
  },
};

