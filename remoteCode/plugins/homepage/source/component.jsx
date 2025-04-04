import React, { useEffect, useContext, useCallback, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Image, 
  TouchableOpacity, 
  NativeModules, 
  ScrollView,
  Platform 
} from 'react-native';
import { 
  datasourceTypeModelSel, 
  navigateToScreen, 
  useApptileWindowDims 
} from 'apptile-core';
import { useSelector, useDispatch } from 'react-redux';
import { cacheCollectionData, fetchCollectionData } from '../../../../extractedQueries/collectionqueries';
import ChipCollectionCarousel from './ChipCollectionCarousel/index';
import QuickCollections from './QuickCollections';
import CelebPicks from './CelebPicks';
import MultiCollectionCarousel from './MultiCollectionCarousel';
import BannerCarousel from './BannerCarousel';
import {PilgrimContext} from '../../../../PilgrimContext';
import { cheaplyGetShopifyQueryRunner } from '../../../../extractedQueries/selectors';
import WeeklyPicksSection from './weeklypicks/WeeklyPicksSection';

async function decayingWait(checkFn) {
  // By the end this will wait upto ~7 seconds
  const decayIntervals = [10, 100, 300, 500, 1000, 2000, 3000];
  let currentInterval = 0;
  let failure = "";
  let result = null;
  let shouldWait = true;

  try {
    const checkResponse = checkFn();
    failure = checkResponse.failure;
    result = checkResponse.result;
    shouldWait = checkResponse.shouldWait;
  } catch (err) {
    failure = "check fn threw an error";
    console.error("failure in decayWait: ", err);
  }

  while (shouldWait) {
    await new Promise((resolve) => {
      setTimeout(
        () => {
          try {
            const checkResponse = checkFn();
            failure = checkResponse.failure;
            result = checkResponse.result;
            shouldWait = checkResponse.shouldWait;
          } catch (err) {
            failure = "check fn threw an error";
            shouldWait = true;
            console.error("failure in decayWait: ", err);
          }
          resolve({})
        }, 
        decayIntervals[currentInterval++]
      );
    })
  }
  
  if (failure) {
    throw new Error(failure);
  } else {
    return result;
  }
}

async function fetchDataForChipCarousel(collectionHandle) {
  const result = {
    products: [],
    filters: []
  }; 

  try {
    const res = await fetchCollectionData(
      collectionHandle,
      5,
      null,
      'BEST_SELLING', // Sort by
      false, // reverse
      [] // filters
    );

    if (res?.data?.collection?.products?.edges) {
      for (let i = 0; i < res.data.collection.products.edges.length; ++i) {
        const edge = res.data.collection.products.edges[i];
        result.products.push(edge.node);
      }
    }

    if (res?.data?.collection?.products?.filters) {
      result.filters = res.data.collection.products.filters;
    }
  } catch (err) {
    console.error("Failed to fetch data for chip carousel for the collection: ", collectionHandle);
  } 

  return result;
}

async function fetchHomepageChipCarouselData() {
  console.log("Starting fetch for chipcarousels");
  const bestsellersP = fetchDataForChipCarousel("bestsellers");
  const makeupP = fetchDataForChipCarousel("makeup");
  const newLaunchP = fetchDataForChipCarousel("new-launch");
  return Promise.all([bestsellersP, makeupP, newLaunchP]);
}

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
  const [childrenData, setChildrenData] = useState({
    bestsellers: {
      status: "notstarted",
      products: [],
      filters: [],
      error: ""
    },
    makeup: {
      loading: "notstarted",
      products: [],
      filters: [],
      error: ""
    },
    newLaunch: {
      loading: "notstarted",
      products: [],
      filters: [],
      error: ""
    }
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        const { RNApptile } = NativeModules;
        RNApptile.notifyJSReady();
      }, 50);
    }
    fetchHomepageChipCarouselData()
      .then(([bestsellers, makeup, newLaunch]) => {
        console.log("Finishing carousel data fetch for chipcarousels")
        setChildrenData({
          bestsellers: {
            status: "loaded",
            products: bestsellers.products,
            filters: bestsellers.filters,
            error: ""
          }, 
          makeup: {
            status: "loaded",
            products: makeup.products,
            filters: makeup.filters,
            error: ""
          },
          newLaunch: {
            status: "loaded",
            products: newLaunch.products,
            filters: newLaunch.filters,
            error: ""
          },
        });
      })
      .catch(err => {
        console.error("Failed to fetch data for homepage", err);
        const errorMessage = "Error: " + err.toString();
        setChildrenData(prev => {
          return {
            bestsellers: {
              ...prev.bestsellers,
              status: "error",
              error: errorMessage
            }, 
            makeup: {
              ...prev.makeup,
              status: "error",
              error: errorMessage
            },
            newLaunch: {
              ...prev.newLaunch,
              status: "error",
              error: errorMessage
            }
          }
        })
      })
  }, []);
  // const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));

  // useEffect(() => {
  //   if (quickCollectionsData.length > 0) {
  //     setTimeout(() => {
  //       // const queryRunner = shopifyDSModel?.get('queryRunner');
  //       for (let i = 0; i < quickCollectionsData.length; ++i) {
  //         fetchCollectionData(quickCollectionsData[i].collection, 12);
  //       }
  //     }, 2000);
  //   }
  // }, [quickCollectionsData])

  const handleScroll = useCallback(
    (ev) => {
      const currentY = ev.nativeEvent.contentOffset.y;

      const delY = currentY - prevScrollY.current;

      // Determine scroll direction
      const isScrollingDown = delY > 100;
      const isScrollingUp = delY < -100;

      if (currentY < 80 && pilgrimGlobals.homePageScrolledDown) {
        console.log("Setting scrollup to show the searchbar because we reached the top");
        // setPilgrimGlobals((prev) => ({...prev, homePageScrolledDown: false}));
      } else if (currentY >= 80) {
        // Update state only if needed
        if (isScrollingDown && !pilgrimGlobals.homePageScrolledDown) {
          console.log("Setting scrolldown to hide the searchbar");
          // setPilgrimGlobals((prev) => ({ ...prev, homePageScrolledDown: true }));
        } else if (isScrollingUp && pilgrimGlobals.homePageScrolledDown) {
          console.log("Setting scrollup to show the scrollbar");
          // setPilgrimGlobals((prev) => ({ ...prev, homePageScrolledDown: false }));
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
      <BannerCarousel 
        items={imageCarouselImages}
        screenWidth={screenWidth}
        onNavigate={(screen, params) => dispatch(navigateToScreen(screen, params))}
      />
      <WeeklyPicksSection
        products={childrenData.newLaunch.products}
        loading={childrenData.newLaunch.status !== "loaded"}
        error={childrenData.newLaunch.error}
      />
      <ChipCollectionCarousel
        collectionHandle={'bestsellers'}
        numberOfProducts={numberOfProducts}
        data={childrenData.bestsellers}
      />
      <CelebPicks celebs={celebPicksData} />
      <MultiCollectionCarousel />
      <ChipCollectionCarousel
        collectionHandle={'makeup'}
        numberOfProducts={numberOfProducts}
        data={childrenData.makeup}
      />
      <ChipCollectionCarousel
        collectionHandle={'new-launch'}
        numberOfProducts={numberOfProducts}
        data={childrenData.newLaunch}
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
