import React, { memo } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import { navigateToScreen } from 'apptile-core';
import { fetchCollectionData } from '../../../../../extractedQueries/collectionqueries';
import RelatedProductsCarousel, {formatProductsForCarousel} from '../../../../../extractedQueries/RelatedProductsCarousel';
import Header from '../Header';

function ChipCollectionCarousel({ 
  data,
  collectionHandle = 'bestsellers',
  numberOfProducts = 5,
  title,
  style,
  onSelectShade,
  onSelectVariant
}) {
  console.log("Rendering chip collection carousel: ", collectionHandle);
  const dispatch = useDispatch();
  // const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  // const { queryRunner, addLineItemToCart } = useShopifyQueryAndAddtoCart();
  // const queryRunner = useShopifyQueryRunner();
  // const [products, setProducts] = useState([]);
  const products = data.products;
  // const [loading, setLoading] = useState(false);
  let loading = false; 
  if (data.status === "loading") {
    loading = true;
  }
  // const [filterLoading, setFilterLoading] = useState(false);
  // const [error, setError] = useState(null);
  const error = data.error;
  // const [filterData, setFilterData] = useState([]);
  const filterData = data.filters;
  // const [selectedFilters, setSelectedFilters] = useState([]);

  // Function to fetch products with filters
  async function fetchProducts (collectionHandle, numberOfProducts, filters = [], isFilterChange = false) {
    try {
      // Set the appropriate loading state
      if (isFilterChange) {
        // setFilterLoading(true);
      } else {
        // setLoading(true);
      }
      
      // const queryRunner = shopifyDSModel?.get('queryRunner');
      
      // Fetch products from collection
      const result = await fetchCollectionData(
        collectionHandle,
        numberOfProducts,
        null, // after cursor
        'BEST_SELLING', // Sort by best selling
        false, // reverse
        filters // Apply filters if any
      );
      
      if (result?.data?.collection?.products?.edges) {
        console.log("Setting products")
        setProducts(result.data.collection.products.edges.map(edge => edge.node));
      } else {
        console.log("Clearing products")
        setProducts([]);
      }
      
      // Store filter data if available
      if (result?.data?.collection?.products?.filters) {
        setFilterData(result.data.collection.products.filters);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.toString());
    } finally {
      // setLoading(false);
      // setFilterLoading(false);
    }
  };

  // Function to handle filter selection
  const handleFilterSelect = (filterId, valueId) => {
    setSelectedFilters(prev => {
      // Check if this filter is already selected
      const existingFilterIndex = prev.findIndex(f => f.id === filterId);
      
      let newFilters;
      if (existingFilterIndex >= 0) {
        // Filter exists, check if value is already selected
        const existingFilter = prev[existingFilterIndex];
        const valueIndex = existingFilter.values.indexOf(valueId);
        
        if (valueIndex >= 0) {
          // Value already exists, do nothing
          return prev;
        } else {
          // Value doesn't exist, add it
          newFilters = [...prev];
          newFilters[existingFilterIndex] = {
            ...existingFilter,
            values: [...existingFilter.values, valueId]
          };
        }
      } else {
        // Filter doesn't exist, add it with the value
        newFilters = [...prev, { id: filterId, values: [valueId] }];
      }
      
      // Apply filters
      const shopifyFilters = newFilters.map(filter => {
        // Check if this is a metafield filter
        if (filter.id.includes('p.m')) {
          const parts = filter.id.split('.');
          if (parts.length >= 4) {
            const namespace = parts[parts.length - 2];
            const key = parts[parts.length - 1];
            
            return filter.values.map(valueId => {
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
        
        return {
          productFilter: {
            filterType: filter.id,
            values: filter.values
          }
        };
      }).flat();
      
      // Fetch products with the new filters, indicating this is a filter change
      fetchProducts(collectionHandle, numberOfProducts, shopifyFilters, true);
      
      return newFilters;
    });
  };
  
  // Function to handle filter removal
  const handleFilterRemove = (filterId, valueId) => {
    setSelectedFilters(prev => {
      // Find the filter in the array
      const filterIndex = prev.findIndex(f => f.id === filterId);
      
      if (filterIndex >= 0) {
        const filter = prev[filterIndex];
        
        // Remove the value from the filter's values array
        const valueIndex = filter.values.indexOf(valueId);
        if (valueIndex >= 0) {
          const newValues = [...filter.values];
          newValues.splice(valueIndex, 1);
          
          // If no values left, remove the filter entirely
          let newFilters;
          if (newValues.length === 0) {
            newFilters = [...prev];
            newFilters.splice(filterIndex, 1);
          } else {
            // Otherwise update the filter with the new values
            newFilters = [...prev];
            newFilters[filterIndex] = {
              ...filter,
              values: newValues
            };
          }
          
          // Apply filters
          const shopifyFilters = newFilters.map(filter => {
            // Check if this is a metafield filter
            if (filter.id.includes('p.m')) {
              const parts = filter.id.split('.');
              if (parts.length >= 4) {
                const namespace = parts[parts.length - 2];
                const key = parts[parts.length - 1];
                
                return filter.values.map(valueId => {
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
            
            return {
              productFilter: {
                filterType: filter.id,
                values: filter.values
              }
            };
          }).flat();
          
          // Fetch products with the new filters, indicating this is a filter change
          fetchProducts(collectionHandle, numberOfProducts, shopifyFilters, true);
          
          return newFilters;
        }
      }
      
      // If we get here, nothing changed
      return prev;
    });
  };
  
  // Function to clear all filters
  const handleClearAllFilters = () => {
    setSelectedFilters([]);
    fetchProducts(collectionHandle, numberOfProducts, [], true); // Fetch products with no filters, indicating this is a filter change
  };

  // Handle "See All" button click
  const handleSeeAllClick = () => {
    dispatch(navigateToScreen('NewCollection', { collectionHandle }));
  };
  
  // Format products for the carousel
  const formattedProducts = formatProductsForCarousel(products);

  // Display title with capitalized first letter and spaces instead of hyphens
  const displayTitle = title || (collectionHandle.charAt(0).toUpperCase() + 
                               collectionHandle.slice(1).replace(/-/g, ' '));

  return (
    <View style={[styles.container, style]}>
      {/* Title and See All button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{displayTitle}</Text>
        <TouchableOpacity onPress={handleSeeAllClick}>
          <Text style={styles.seeAllButton}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter chips header */}
      <Header 
        filterData={filterData}
        selectedFilters={[]}
        onFilterRemove={handleFilterRemove}
        onFilterSelect={handleFilterSelect}
        onClearAllFilters={handleClearAllFilters}
      />
      
      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00909E" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noProductsText}>No products found</Text>
        </View>
      ) : (
        <RelatedProductsCarousel 
          title="" // We're already showing the title above
          products={formattedProducts}
          // initialProductsToLoad={5}
          style={styles.carousel}
          onSelectShade={onSelectShade}
          onSelectVariant={onSelectVariant}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#00909E',
    fontWeight: '500',
  },
  linearLoader: {
    height: 2,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
  },
  carousel: {
    marginTop: 8,
  }
});

export default memo(ChipCollectionCarousel);
