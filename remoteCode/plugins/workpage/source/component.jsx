import React, {useEffect} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { useSelector } from 'react-redux';
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import ChipCollectionCarousel from './ChipCollectionCarousel';
import QuickCollections from './QuickCollections';
import ImageCarousel from '../../../../extractedQueries/ImageCarousel';

export function ReactComponent({ model }) {
  // Get collection handle and number of products from model props or use defaults
  const numberOfProducts = 5;
  const {width: screenWidth} = useApptileWindowDims();
  const quickCollectionsData = model.get('quickCollections') || [];
  const imageCarouselImages = model.get('imageCarouselImages') || [];
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  useEffect(() => {
    if (quickCollectionsData.length > 0) {
      setTimeout(() => {
        const queryRunner = shopifyDSModel?.get('queryRunner');
        for (let i = 0; i < quickCollectionsData.length; ++i) {
          fetchCollectionData(queryRunner, quickCollectionsData[i].collection, 12);
        }
      }, 2000);
    }
  }, [quickCollectionsData])

  return (
    <View style={styles.container}>
      <QuickCollections 
        collections={quickCollectionsData}
      />
      <View style={{position: 'relative'}}>      
        <ImageCarousel 
          aspectRatio={1.8}
          images={imageCarouselImages.map((it, i) => ({id: i, url: it.urls[0]}))}
          width={screenWidth}
        />
      </View>
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
  numberOfProducts: '',
  imageCarouselImages: []
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
    },
    {
      type: 'customData',
      name: 'imageCarouselImages',
      props: {
        label: 'Image carousel images',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            fields: {
              urls: {type: 'image'},
              title: {type: 'string'},
              subtitle: {type: 'string'},
              collection: {type: 'collection', dataFormat: 'handle'},
              product: {type: 'product', dataFormat: 'handle'}
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
