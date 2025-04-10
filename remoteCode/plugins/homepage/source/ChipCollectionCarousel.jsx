import React, { memo, useEffect, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useDispatch } from 'react-redux';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
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
  // Get window dimensions
  const { width: screenWidth } = useApptileWindowDims();
  
  // Animation for loading indicator
  const loadingAnimation = useRef(new Animated.Value(-100)).current;
  const animationRef = useRef(null);
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
  
  // Animation effect
  useEffect(() => {
    // Function to run the animation
    const runAnimation = () => {
      // Reset animation to start position
      loadingAnimation.setValue(-screenWidth);
      
      // Start the animation
      animationRef.current = Animated.timing(loadingAnimation, {
        toValue: 0,
        duration: 1000, // Duration for the animation to complete
        useNativeDriver: true
      });
      
      // Start animation and set up the loop with pause
      animationRef.current.start(({finished}) => {
        // When animation completes, wait 500ms before restarting
        if (finished) {
          if (!loading) {
            loadingAnimation.setValue(-screenWidth);
          }
          setTimeout(() => {
            if (loading) {
              runAnimation();
            } 
          }, 500);
        }
      });
    };

    // Start or stop animation based on loading prop
    if (loading) {
      runAnimation();
    } else {
      // Stop any running animation
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      loadingAnimation.setValue(-screenWidth);
    }

    // Cleanup function to stop animation when component unmounts
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
        loadingAnimation.setValue(-screenWidth);
      }
    };
  }, [loading, loadingAnimation, screenWidth]);

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
          { (
            <View style={{height: 2, width: "100%", overflow: 'hidden'}}>
              <Animated.View 
                style={{
                  height: 2, 
                  backgroundColor: "#00909E", 
                  width: screenWidth, // Width of the moving line
                  transform: [{
                    translateX: loadingAnimation
                  }]
                }}
              />
            </View>
          )}
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
