import React from 'react';
import {View, StyleSheet} from 'react-native';
import CollectionCarouselComponent from './CollectionCarousel';

/**
 * MultiCollectionCarousel component that displays multiple collection carousels
 * for the specified collection handles.
 */
export default function MultiCollectionCarousel() {
  // Collection handles to display
  const collectionHandles = ['pore-care', 'hair-care', 'makeup'];

  console.log("[AGENT] rendering multicollection carousel")
  return (
    <View style={styles.container}>
      {collectionHandles.map((handle, i) => {
        return (
          <CollectionCarouselComponent 
            key={handle} 
            collectionHandle={handle} 
            delay={(i + 1) * 1000}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
});
