import React, {useEffect} from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { datasourceTypeModelSel, navigateToScreen, useApptileWindowDims } from 'apptile-core';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import ChipCollectionCarousel from './ChipCollectionCarousel';
import QuickCollections from './QuickCollections';
import CelebPicks from './CelebPicks';
import {Carousel} from '../../../../extractedQueries/ImageCarousel';

export function ReactComponent({ model }) {
  const dispatch = useDispatch();
  // Get collection handle and number of products from model props or use defaults
  const numberOfProducts = 5;
  const {width: screenWidth} = useApptileWindowDims();
  const quickCollectionsData = model.get('quickCollections') || [];
  const imageCarouselImages = model.get('imageCarouselImages') || [];
  const celebPicksData = model.get('celebPicksData') || [];
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
        <Carousel 
          flatlistData={imageCarouselImages.map(
            (it, i) => ({
              id: i, 
              ...it,
              url: it.urls[0],
            })
          )}
          width={screenWidth}
          renderChildren={({item}) => {
            return (
              <View style={{position: 'relative'}}>
                <Image 
                  source={{uri: item.url}}
                  resizeMode="contain"
                  style={{
                    width: screenWidth,
                    aspectRatio: 1.7,
                    minHeight: 100,
                  }}
                />   
                <View 
                  style={{
                    position: 'absolute', 
                    width: 200,
                    left: 10
                  }}
                >
                  <Text 
                    style={{
                      fontSize: 44, 
                      fontWeight: '600'
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text 
                    style={{
                      fontSize: 20, 
                      fontWeight: '300'
                    }}
                  >
                    {item.subtitle}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.collection) {
                        dispatch(navigateToScreen('NewCollection', {collectionHandle: item.collection}));
                      } else if (item.product) {
                        dispatch(navigateToScreen('NewProduct', {productHandle: item.product}));
                      }
                    }}
                    style={{
                      height: 33,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#ffffff88',
                      marginTop: 20,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      width: 100,
                    }}
                  >
                    <Text>Shop now -&gt;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
      <ChipCollectionCarousel 
        collectionHandle={'bestsellers'}
        numberOfProducts={numberOfProducts}
      />
      <CelebPicks celebs={celebPicksData} />
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
  imageCarouselImages: [],
  celebPicksData: []
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
    },
    {
      type: 'customData',
      name: 'celebPicksData',
      props: {
        label: 'Celeb picks',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            fields: {
              title: {type: 'string'},
              urls: {type: 'image'},
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
