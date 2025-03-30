import React, { useEffect, useContext, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Image, 
  TouchableOpacity, 
  NativeModules, 
  ScrollView 
} from 'react-native';
import { 
  datasourceTypeModelSel, 
  navigateToScreen, 
  useApptileWindowDims 
} from 'apptile-core';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import ChipCollectionCarousel from './ChipCollectionCarousel';
import QuickCollections from './QuickCollections';
import CelebPicks from './CelebPicks';
import MultiCollectionCarousel from './MultiCollectionCarousel';
import { Carousel } from '../../../../extractedQueries/ImageCarousel';
import { Platform } from 'react-native';
import {PilgrimContext} from '../../../../PilgrimContext';

export function ReactComponent({ model }) {
  const {pilgrimGlobals, setPilgrimGlobals} = useContext(PilgrimContext);
  const prevScrollY = useRef(0);
  const dispatch = useDispatch();
  // Get collection handle and number of products from model props or use defaults
  const numberOfProducts = 5;
  const { width: screenWidth } = useApptileWindowDims();
  const quickCollectionsData = model.get('quickCollections') || [];
  const imageCarouselImages = model.get('imageCarouselImages') || [];
  const celebPicksData = model.get('celebPicksData') || [];
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        const { RNApptile } = NativeModules;
        RNApptile.notifyJSReady();
      }, 300);
    }
  }, []);

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

  const handleScroll = useCallback(
    (ev) => {
      const currentY = ev.nativeEvent.contentOffset.y;

      const delY = currentY - prevScrollY.current;

      // Determine scroll direction
      const isScrollingDown = delY > 100;
      const isScrollingUp = delY < -100;

      if (currentY < 80 && pilgrimGlobals.homePageScrolledDown) {
        console.log("Showing searchbar because scroll location is near the top");
        setPilgrimGlobals((prev) => ({...prev, homePageScrolledDown: false}));
      } else if (currentY >= 80) {
        // Update state only if needed
        if (isScrollingDown && !pilgrimGlobals.homePageScrolledDown) {
          console.log("Setting scrolldown to hide the searchbar");
          setPilgrimGlobals((prev) => ({ ...prev, homePageScrolledDown: true }));
        } else if (isScrollingUp && pilgrimGlobals.homePageScrolledDown) {
          console.log("Setting scrollup to show the scrollbar");
          setPilgrimGlobals((prev) => ({ ...prev, homePageScrolledDown: false }));
        }
      }

      if (Math.abs(delY) > 100) {
        prevScrollY.current = currentY; 
      }
    },
    [pilgrimGlobals, setPilgrimGlobals]
  );

  return (
    <ScrollView 
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={50}
    >
      <QuickCollections
        collections={quickCollectionsData}
      />
      <View style={{ position: 'relative' }}>
        <Carousel
          flatlistData={imageCarouselImages.map(
            (it, i) => ({
              id: i,
              ...it,
              url: it.urls[0],
            })
          )}
          width={screenWidth}
          renderChildren={({ item }) => {
            return (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: item.url }}
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
                        dispatch(navigateToScreen('NewCollection', { collectionHandle: item.collection }));
                      } else if (item.product) {
                        dispatch(navigateToScreen('NewProduct', { productHandle: item.product }));
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
      <MultiCollectionCarousel />
      <ChipCollectionCarousel
        collectionHandle={'makeup'}
        numberOfProducts={numberOfProducts}
      />
      <ChipCollectionCarousel
        collectionHandle={'new-launch'}
        numberOfProducts={numberOfProducts}
      />
    </ScrollView>
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
              urls: { type: 'image' },
              title: { type: 'string' },
              collection: { type: 'collection', dataFormat: 'handle' }
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
              urls: { type: 'image' },
              title: { type: 'string' },
              subtitle: { type: 'string' },
              collection: { type: 'collection', dataFormat: 'handle' },
              product: { type: 'product', dataFormat: 'handle' }
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
              title: { type: 'string' },
              urls: { type: 'image' },
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

