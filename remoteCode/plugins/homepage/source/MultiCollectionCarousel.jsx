import React from 'react';
import {View, StyleSheet} from 'react-native';
import CollectionCarouselComponent from './CollectionCarousel';

/**
 * MultiCollectionCarousel component that displays multiple collection carousels
 * for the specified collection handles.
 * Data fetching is now centralized in this component to prevent re-renders in child components.
 */
export default function MultiCollectionCarousel({collectionsData}) {
  // Collection handles to display
  const collectionHandles = Object.keys(collectionsData);

  console.log("[AGENT] rendering multicollection carousel")
  
  return (
    <View style={styles.container}>
      {collectionHandles.map((handle) => {
        const collectionData = collectionsData[handle] || {};
        
        return (
          <CollectionCarouselComponent 
            key={handle} 
            collectionHandle={handle}
            carouselData={collectionData.data}
            error={collectionData.error}
            loading={false} // We're handling loading at the parent level
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
  },
});
