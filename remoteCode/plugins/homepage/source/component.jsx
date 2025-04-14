import React, { useEffect, useContext, useCallback, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Image, 
  TouchableOpacity, 
  NativeModules, 
  SectionList,
  Platform 
} from 'react-native';
import { 
  navigateToScreen, 
  useApptileWindowDims 
} from 'apptile-core';
import { useDispatch } from 'react-redux';
import { fetchCollectionCarouselData, getFilterAndProductsForCollection } from '../../../../extractedQueries/collectionqueries';
import ChipCollectionCarousel from './ChipCollectionCarousel';
import QuickCollections from './QuickCollections';
import CelebPicks from './CelebPicks';
import MultiCollectionCarousel from './MultiCollectionCarousel';
import BannerCarousel from './BannerCarousel';
// import {PilgrimContext} from '../../../../PilgrimContext';
import WeeklyPicksSection from './weeklypicks/WeeklyPicksSection';
import PilgrimCode from '../../../../extractedQueries/PilgrimCode';
import ExternalLinks from '../../../../extractedQueries/ExternalLinks';
import ShadeSelector from '../../../../extractedQueries/ShadeSelector';
import VariantSelector from '../../../../extractedQueries/VariantSelector';
// import {typography} from '../../../../extractedQueries/theme'

async function fetchHomepageChipCarouselData() {
  console.log("Starting fetch for chipcarousels");
  const bestsellersP = getFilterAndProductsForCollection("bestsellers");
  const makeupP = getFilterAndProductsForCollection("makeup");
  const newLaunchP = getFilterAndProductsForCollection("new-launch");
  return Promise.all([bestsellersP, makeupP, newLaunchP]);
}

async function fetchMultiCollectionCarouselData() {
  console.log("Starting fetch for multicollection carousel");
  const poreCareP = fetchCollectionCarouselData("pore-care");
  const hairCareP = fetchCollectionCarouselData("pore-care");
  const makeupP = fetchCollectionCarouselData("pore-care");
  return Promise.all([poreCareP, hairCareP, makeupP]);
}

export function ReactComponent({ model }) {
  // const {pilgrimGlobals, setPilgrimGlobals} = useContext(PilgrimContext);
  // const prevScrollY = useRef(0);
  const shadeBottomSheetRef = useRef(null);
  const variantBottomSheetRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dispatch = useDispatch();
  // Get collection handle and number of products from model props or use defaults
  const numberOfProducts = 5;
  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();
  const quickCollectionsData = model.get('quickCollections') || [];
  const imageCarouselImages = model.get('imageCarouselImages') || [];
  const celebPicksData = model.get('celebPicksData') || [];
  const [chipCollectionData, setChipCollectionData] = useState({
    bestsellers: {
      status: "notstarted",
      products: [],
      filters: [],
      selectedFilters: [],
      error: ""
    },
    makeup: {
      loading: "notstarted",
      products: [],
      filters: [],
      selectedFilters: [],
      error: ""
    },
    "new-launch": {
      loading: "notstarted",
      products: [],
      filters: [],
      selectedFilters: [],
      error: ""
    }
  });
  const [multiCollectionCarouselData, setMultiCollectionCarouselData] = useState({
    'pore-care': {
      status: "notstarted",
      data: {},
      error: ""
    },
    'hair-care': {
      status: "notstarted",
      data: {},
      error: ""
    },
    makeup: {
      status: "notstarted",
      data: {},
      error: ""
    }
  })

  
  // Gets filter id to add to the set of selectedFilters which is an array of filterId's
  // that are already selected and adds the new filter object using allFilters
  // Everything is passed in as arguments instead of dependencies in usecallback
  // to avoid unnecessary re-renders of the children
  async function getFilteredDataForCollection(collectionHandle, newSelectedFilters, allFilters) {
    setChipCollectionData(prev => {
      return {
        ...prev,
        [collectionHandle]: {
          ...prev[collectionHandle],
          status: "loading",
          selectedFilters: newSelectedFilters
        }
      }
    });

    try {
      // double loop but only runs when user clicks a filter. Should be fine.
      const filtersById = new Map();
      for (let i = 0; i < allFilters.length; ++i) {
        filtersById.set(allFilters[i].id, allFilters[i]);
      }
      const filters = newSelectedFilters.map(filterId => {
        const filterToSend = filtersById.get(filterId);
        return JSON.parse(filterToSend.input);
      });
      
      const res = await getFilterAndProductsForCollection(collectionHandle, filters); 
      setChipCollectionData(prev => {
        return {
          ...prev,
          [collectionHandle]: {
            ...prev[collectionHandle],
            status: "loaded",
            products: res.products,
          }
        }
      });
    } catch (err) {
      console.error("Failed to fetch data for the applied filters: ", collectionHandle, err);
      setChipCollectionData(prev => {
        return {
          ...prev,
          [collectionHandle]: {
            ...prev[collectionHandle],
            status: "error",
            products,
          }
        }
      });
    }
  }

  const onFilterSelect = useCallback((collectionHandle, filter, selectedFilters, allFilters) => {
    const newSelectedFilters = selectedFilters.concat(filter);
    getFilteredDataForCollection(collectionHandle, newSelectedFilters, allFilters);
  }, []);

  const onFilterRemove = useCallback((collectionHandle, filter, selectedFilters, allFilters) => {
    const newSelectedFilters = selectedFilters.filter(id => id !== filter);
    getFilteredDataForCollection(collectionHandle, newSelectedFilters, allFilters);
  }, []);

  const onClearAllFilters = useCallback((collectionHandle, filter, selectedFilters, allFilters) => {
    getFilteredDataForCollection(collectionHandle, [], allFilters);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      console.log("[AGENT] Dismissing splash");
      setTimeout(() => {
        const { RNApptile } = NativeModules;
        RNApptile.notifyJSReady();
      }, 50);
    }

    fetchMultiCollectionCarouselData()
      .then(([poreCare, hairCare, makeup]) => {
        console.log("Finish loading data for multicollection carousel");
        setMultiCollectionCarouselData({
          'pore-care': {
            status: "loaded",
            data: poreCare,
            error: ""
          },
          'hair-care': {
            status: "loaded",
            data: hairCare,
            error: ""
          },
          makeup: {
            status: "loaded",
            data: makeup,
            error: ""
          }
        });
      })
      .catch(err => {
        const errorMessage = "Error: " + err.toString();
        setMultiCollectionCarouselData(prev => {
          return {
            'pore-care': {
              ...prev.poreCare,
              status: "error",
              error: errorMessage
            },
            'hair-care': {
              ...prev.hairCare,
              status: "error",
              error: errorMessage
            },
            makeup: {
              ...prev.makeup,
              status: "error",
              error: errorMessage
            }
          };
        });
      })

    fetchHomepageChipCarouselData()
      .then(([bestsellers, makeup, newLaunch]) => {
        console.log("Finishing carousel data fetch for chipcarousels");
        setChipCollectionData({
          bestsellers: {
            status: "loaded",
            products: bestsellers.products,
            filters: bestsellers.filters,
            selectedFilters: [],
            error: ""
          }, 
          makeup: {
            status: "loaded",
            products: makeup.products,
            filters: makeup.filters,
            selectedFilters: [],
            error: ""
          },
          "new-launch": {
            status: "loaded",
            products: newLaunch.products,
            filters: newLaunch.filters,
            selectedFilters: [],
            error: ""
          },
        });
      })
      .catch(err => {
        console.error("Failed to fetch data for homepage", err);
        const errorMessage = "Error: " + err.toString();
        setChipCollectionData(prev => {
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
            "new-launch": {
              ...prev["new-launch"],
              status: "error",
              error: errorMessage
            }
          }
        })
      })
  }, []);

  const onSelectShade = (product) => {
    setSelectedProduct(product);
    shadeBottomSheetRef.current?.show();
  };
  
  // Handle Choose Variant button click
  const onSelectVariant = (product) => {
    setSelectedProduct(product);
    variantBottomSheetRef.current?.show();
  };
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

  // Define sections for SectionList
  const sections = [
    {
      title: "Quick Collections",
      type: 'quick-collections',
      key: 'quick-collections',
      data: [{}]
    },
    // {
    //   title: "Banner Carousel",
    //   type: 'banner-carousel',
    //   key: 'banner-carousel',
    //   data: [{}]
    // },
    // {
    //   title: "Weekly Picks",
    //   type: 'weekly-picks',
    //   key: 'weekly-picks',
    //   data: [{}]
    // },
    {
      title: "Bestsellers",
      type: 'bestsellers',
      key: 'bestsellers',
      data: [{}]
    },
    {
      title: "Celeb Picks",
      type: 'celeb-picks',
      key: 'celeb-picks',
      data: [{}]
    },
    {
      title: "Multi Collection",
      type: 'multi-collection',
      key: 'multi-collection',
      data: [{}]
    },
    {
      title: "Makeup",
      type: 'makeup',
      key: 'makeup',
      data: [{}]
    },
    {
      title: "New Launch",
      type: 'new-launch',
      key: 'new-launch',
      data: [{}]
    },
    {
      title: "Pilgrim Code",
      type: 'pilgrim-code',
      key: 'pilgrim-code',
      data: [{}]
    },
    {
      title: "External links",
      type: 'external-links',
      key: 'external-links',
      data: [{}]
    }
  ];

  // Render section headers (currently not displaying any headers)
  const renderSectionHeader = ({ section }) => null;

  // Render each section based on its type
  const renderItem = ({ item, section }) => {
    switch (section.type) {
      case 'quick-collections':
        return (
          <>
            <QuickCollections
              collections={quickCollectionsData}
            />
            <BannerCarousel 
              items={imageCarouselImages}
              screenWidth={screenWidth}
              onNavigate={(screen, params) => dispatch(navigateToScreen(screen, params))}
            />
            <WeeklyPicksSection
              products={chipCollectionData["new-launch"].products}
              loading={chipCollectionData["new-launch"].status !== "loaded"}
              error={chipCollectionData["new-launch"].error}
              onSelectShade={onSelectShade}
              onSelectVariant={onSelectVariant}
            />
          </>
        );
      case 'bestsellers':
        return (
          <ChipCollectionCarousel
            collectionHandle={'bestsellers'}
            numberOfProducts={numberOfProducts}
            data={chipCollectionData.bestsellers}
            onSelectShade={onSelectShade}
            onSelectVariant={onSelectVariant}
            onFilterSelect={onFilterSelect}
            onFilterRemove={onFilterRemove}
            onFilterClear={onClearAllFilters}
          />
        );
      case 'celeb-picks':
        return (
          <CelebPicks celebs={celebPicksData} />
        );
      case 'multi-collection':
        return (
          <MultiCollectionCarousel 
            collectionsData={multiCollectionCarouselData}
          />
        );
      case 'makeup':
        return (
          <ChipCollectionCarousel
            collectionHandle={'makeup'}
            numberOfProducts={numberOfProducts}
            data={chipCollectionData.makeup}
            onSelectShade={onSelectShade}
            onSelectVariant={onSelectVariant}
            onFilterSelect={onFilterSelect}
            onFilterRemove={onFilterRemove}
            onFilterClear={onClearAllFilters}
          />
        );
      case 'new-launch':
        return (
          <ChipCollectionCarousel
            collectionHandle={'new-launch'}
            numberOfProducts={numberOfProducts}
            data={chipCollectionData["new-launch"]}
            onSelectShade={onSelectShade}
            onSelectVariant={onSelectVariant}
            onFilterSelect={onFilterSelect}
            onFilterRemove={onFilterRemove}
            onFilterClear={onClearAllFilters}
          />
        );
      case 'pilgrim-code':
        return (
          <PilgrimCode />
        );
      case 'external-links':
        return (
          <ExternalLinks />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* <View 
        style={{
          width: screenWidth, 
          height: screenHeight,
          flexDirection: 'column',
          borderWidth: 2,
          position: 'relative',
          top: 50,
          borderColor: 'red'
        }}
      >
        <Text style={typography.heading20}>Heading-20</Text>
        <Text style={typography.heading19}>Heading-19</Text>
        <Text style={typography.heading14}>Heading-14</Text>
        <Text style={typography.price}>695</Text>
        <Text style={typography.slashedPrice}>895</Text>
        <Text style={typography.savings}>20% Off</Text>
        <Text style={typography.subHeading15}>Sub-Heading-15</Text>
        <Text style={typography.subHeading14}>Sub-Heading-14</Text>
        <Text style={typography.subHeading12}>Sub-Heading-12</Text>
        <Text style={typography.body14}>body-14</Text>
        <Text style={typography.bestseller}>BESTSELLER</Text>
      </View> */}
      <SectionList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => index.toString()}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={true}
        // onScroll={handleScroll}
        scrollEventThrottle={50}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={Platform.OS !== 'web'}
      />

      {/* Shade Selector Modal */}
      <ShadeSelector 
        bottomSheetRef={shadeBottomSheetRef}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      
      {/* Variant Selector Modal */}
      <VariantSelector 
        bottomSheetRef={variantBottomSheetRef}
        product={selectedProduct}
        optionName={"Size"}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: '#fff'
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
            properties: {
              image: { type: 'image' },
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
            properties: {
              image: { type: 'image' },
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
            properties: {
              title: { type: 'string' },
              image: { type: 'image' },
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
