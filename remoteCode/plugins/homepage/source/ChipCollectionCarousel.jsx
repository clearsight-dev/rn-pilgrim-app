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
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import RelatedProductsCarousel from '../../../../extractedQueries/RelatedProductsCarousel';
import Header from './Header';

function ChipCollectionCarousel({ 
  data,
  collectionHandle = 'bestsellers',
  title,
  style,
  onSelectShade,
  onSelectVariant,
  onFilterSelect,
  onFilterRemove,
  onFilterClear
}) {
  console.log("Rendering chip collection carousel: ", collectionHandle);
  const dispatch = useDispatch();
  const products = data.products;
  let loading = false; 
  if (data.status === "loading") {
    loading = true;
  }
  const error = data.error;
  const filterData = data.filters;
  const selectedFilters = data.selectedFilters;


  // Handle "See All" button click
  const handleSeeAllClick = () => {
    dispatch(navigateToScreen('Collection', { collectionHandle }));
  };
  
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
        selectedFilters={selectedFilters}
        onFilterRemove={filter => onFilterRemove(collectionHandle, filter, selectedFilters, filterData)}
        onFilterSelect={filter => onFilterSelect(collectionHandle, filter, selectedFilters, filterData)}
        onClearAllFilters={() => onFilterClear(collectionHandle, null, selectedFilters, filterData)}
      />
      
      {/* Cards */}
      { error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noProductsText}>No products found</Text>
        </View>
      ) : (
        <>
          {loading && <View style={{height: 2, backgroundColor: "green", width: "100%"}}/>}
          <RelatedProductsCarousel 
            title="" // We're already showing the title above
            products={products}
            // initialProductsToLoad={5}
            style={styles.carousel}
            onSelectShade={onSelectShade}
            onSelectVariant={onSelectVariant}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
    minHeight: 500 
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
