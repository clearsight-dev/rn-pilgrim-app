import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChipCollectionCarousel from './ChipCollectionCarousel';
import QuickCollections from './QuickCollections';

export function ReactComponent({ model }) {
  // Get collection handle and number of products from model props or use defaults
  const numberOfProducts = 5;
  const quickCollectionsData = model.get('quickCollections') || [];

  return (
    <View style={styles.container}>
      <QuickCollections 
        title="Shop by Category" 
        collections={quickCollectionsData}
      />
      <ChipCollectionCarousel 
        collectionHandle={'bestsellers'}
        numberOfProducts={numberOfProducts}
      />
      <ChipCollectionCarousel 
        collectionHandle={'makeup'}
        numberOfProducts={numberOfProducts}
      />
      <ChipCollectionCarousel 
        collectionHandle={'new-launch'}
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
  quickCollections: [],
  numberOfProducts: ''
};

export const WidgetEditors = {
  basic: [
    {
      type: 'customData',
      name: 'quickCollections',
      props: {
        label: 'Quick collections',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            fields: {
              urls: {type: 'image'},
              title: {type: 'string'},
              collection: {type: 'collection', dataFormat: 'handle'}
            }
          }
        }
      }
    }
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Product Collection Widget',
  defaultProps: {
    collectionHandle: 'bestsellers',
    numberOfProducts: 5
  },
};
