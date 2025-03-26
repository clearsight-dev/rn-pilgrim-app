import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChipCollectionCarousel from './ChipCollectionCarousel';

export function ReactComponent({ model }) {
  // Get collection handle and number of products from model props or use defaults
  const collectionHandle = model?.get('collectionHandle') || 'bestsellers';
  const numberOfProducts = model?.get('numberOfProducts') || 5;

  return (
    <View style={styles.container}>
      <ChipCollectionCarousel 
        collectionHandle={collectionHandle}
        numberOfProducts={numberOfProducts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});

export const WidgetConfig = {
  collectionHandle: {
    type: 'string',
    default: 'bestsellers',
    label: 'Collection Handle',
    description: 'Handle of the collection to display products from'
  },
  numberOfProducts: {
    type: 'number',
    default: 5,
    label: 'Number of Products',
    description: 'Number of products to display'
  }
};

export const WidgetEditors = {
  basic: ['collectionHandle', 'numberOfProducts'],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Product Collection Widget',
  defaultProps: {
    collectionHandle: 'bestsellers',
    numberOfProducts: 5
  },
};
