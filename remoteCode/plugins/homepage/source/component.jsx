import _, { min, set } from 'lodash';
import React, {
  useEffect,
  useContext,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  NativeModules,
  SectionList,
  Platform,
  ActivityIndicator
} from 'react-native';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
import { useDispatch } from 'react-redux';
import {
  fetchCollectionCarouselData,
  getFilterAndProductsForCollection,
} from '../../../../extractedQueries/collectionqueries';
import ChipCollectionCarousel from './ChipCollectionCarousel';
import QuickCollections from './QuickCollections';
import CelebPicks from './CelebPicks';
import MultiCollectionCarousel from './MultiCollectionCarousel';
import { MetafieldBannerCarousel, BannerCarousel } from './BannerCarousel';
// import {PilgrimContext} from '../../../../PilgrimContext';
import WeeklyPicksSection from './weeklypicks/WeeklyPicksSection';
import PilgrimCode from '../../../../extractedQueries/PilgrimCode';
import ExternalLinks from '../../../../extractedQueries/ExternalLinks';
import ShadeSelector from '../../../../extractedQueries/ShadeSelector';
import VariantSelector from '../../../../extractedQueries/VariantSelector';
import CountdownTimer from './CountdownTimer'
// import {dummy as sections} from './dummySections';

import { fetchPageData } from '../../../../queries/pageQuery';
// import {typography} from '../../../../extractedQueries/theme'

const extractCollectionsFromSections = (sections, sectionToPick) => {
  const collections = new Set();

  // Default collections to always fetch
  collections.add('bestsellers');
  collections.add('makeup');
  collections.add('new-launch');

  // Add collections from section configs
  sections.forEach(section => {
    if (sectionToPick.includes(section.type) && section.config?.collection) {
      collections.add(section.config.collection);
    }
  });

  return Array.from(collections);
};

async function fetchHomepageCollectionsData(collections) {
  console.log('Starting fetch for collections:', collections);

  // Create an array of promises for all collections
  const collectionPromises = collections.map(collection =>
    getFilterAndProductsForCollection(collection),
  );

  // Return results as an object with collection handles as keys
  const results = await Promise.all(collectionPromises);
  return collections.reduce((acc, collection, index) => {
    acc[collection] = results[index];
    return acc;
  }, {});
}

/**
 * Transforms the page data to extract specific metafields and their references
 *
 * @param {Object} pageData - The raw page data received from the GraphQL query
 * @returns {Object} - The transformed data with extracted metafields and references
 */
export function transformPageData(pageData) {
  if (!pageData?.data?.page) {
    return {
      pageInfo: {},
      metafields: {},
      bannerContents: [],
    };
  }

  const page = pageData.data.page;
  const metafields = page.metafields || [];

  // Extract banner contents from metafields
  const bannerContentsMetafield = _.find(
    metafields,
    o => ['banner_contents'].includes(o?.key) && o?.namespace === 'custom',
  );

  const bannerContents = _.get(bannerContentsMetafield, 'references.nodes', []);

  // Extract other individual metafields for easy access
  const metafieldValues = {};
  metafields.forEach(metafield => {
    if (metafield.namespace === 'custom') {
      metafieldValues[metafield.key] = metafield.value;
    }
  });

  return {
    pageInfo: {
      id: page.id,
      handle: page.handle,
      title: page.title,
    },
    metafields: metafieldValues,
    bannerContents: bannerContents,
  };
}

/**
 * Extracts essential banner navigation data from transformed page data
 *
 * @param {Object} transformedData - Data returned from transformPageData function
 * @returns {Array} - Array of banner navigation arrays in format [imageUrl, isNavigatable, navigateToScreen, navigateToScreenParam]
 */
export function extractBannerNavigation(transformedData) {
  // Extract banner contents from the transformed data
  const bannerContents = _.get(transformedData, 'bannerContents', []);

  // Map each banner to the required format
  return bannerContents.map(banner => {
    const fields = banner.fields || [];

    // Get image URL
    const imageUrl = _.get(
      _.find(fields, o => ['image'].includes(o?.key)) || {},
      ['reference', 'image', 'url'],
      '',
    );

    // Get navigation type
    const navigateTo = _.get(
      _.find(fields, o => ['navigate_to'].includes(o?.key)) || {},
      ['value'],
      '',
    );

    // Check if navigatable
    const isNavigatable = !_.isEmpty(navigateTo);

    // Determine navigation screen and params based on navigation type
    let navigateToScreenParam = {};

    if (navigateTo === 'Collection') {
      const collectionHandle = _.get(
        _.find(fields, o => ['navigate_to_collection'].includes(o?.key)) || {},
        ['reference', 'handle'],
        '',
      );
      navigateToScreenParam = { collectionHandle };
    } else if (navigateTo === 'Product') {
      const productHandle = _.get(
        _.find(fields, o => ['navigate_to_product'].includes(o?.key)) || {},
        ['reference', 'handle'],
        '',
      );
      navigateToScreenParam = { productHandle };
    }

    // Return array in the requested format
    return {
      imageUrl,
      isNavigatable,
      navigateToScreen: navigateTo,
      navigateToScreenParam,
    };
  });
}

const numberOfProducts = 5;

export function ReactComponent({ model }) {
  const loadedRef = useRef(false);
  const [dataLoadingState, setDataLoadingState] = useState('NOT-STARTED'); // 'IN-PROGRESS' | 'DONE'

  const shadeBottomSheetRef = useRef(null);
  const variantBottomSheetRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [metafieldCarousalData, setMetafieldCarousalData] = useState([]);
  const dispatch = useDispatch();

  // Get collection handle and number of products from model props or use defaults

  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();
  let sections = model.get('widgetList') || [];

  // const [sections, setSections] = React.useState([]);
  const celebPicksData = model.get('celebPicksData') || [];
  const [chipCollectionData, setChipCollectionData] = useState({
    bestsellers: {
      status: 'notstarted',
      products: [],
      filters: [],
      selectedFilters: [],
      error: '',
    },
    makeup: {
      loading: 'notstarted',
      products: [],
      filters: [],
      selectedFilters: [],
      error: '',
    },
    'new-launch': {
      loading: 'notstarted',
      products: [],
      filters: [],
      selectedFilters: [],
      error: '',
    },
  });

  // Gets filter id to add to the set of selectedFilters which is an array of filterId's
  // that are already selected and adds the new filter object using allFilters
  // Everything is passed in as arguments instead of dependencies in usecallback
  // to avoid unnecessary re-renders of the children
  async function getFilteredDataForCollection(
    collectionHandle,
    newSelectedFilters,
    allFilters,
  ) {
    setChipCollectionData(prev => {
      return {
        ...prev,
        [collectionHandle]: {
          ...prev[collectionHandle],
          status: 'loading',
          selectedFilters: newSelectedFilters,
        },
      };
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

      const res = await getFilterAndProductsForCollection(
        collectionHandle,
        filters,
      );
      setChipCollectionData(prev => {
        return {
          ...prev,
          [collectionHandle]: {
            ...prev[collectionHandle],
            status: 'loaded',
            products: res.products,
          },
        };
      });
    } catch (err) {
      console.error(
        'Failed to fetch data for the applied filters: ',
        collectionHandle,
        err,
      );
      setChipCollectionData(prev => {
        return {
          ...prev,
          [collectionHandle]: {
            ...prev[collectionHandle],
            status: 'error',
            products,
          },
        };
      });
    }
  }

  const onFilterSelect = useCallback(
    (collectionHandle, filter, selectedFilters, allFilters) => {
      const newSelectedFilters = selectedFilters.concat(filter);
      getFilteredDataForCollection(
        collectionHandle,
        newSelectedFilters,
        allFilters,
      );
    },
    [],
  );

  const onFilterRemove = useCallback(
    (collectionHandle, filter, selectedFilters, allFilters) => {
      const newSelectedFilters = selectedFilters.filter(id => id !== filter);
      getFilteredDataForCollection(
        collectionHandle,
        newSelectedFilters,
        allFilters,
      );
    },
    [],
  );

  const onClearAllFilters = useCallback(
    (collectionHandle, filter, selectedFilters, allFilters) => {
      getFilteredDataForCollection(collectionHandle, [], allFilters);
    },
    [],
  );

  useEffect(() => {
    if (loadedRef.current) {
      return;
    }
    const loadData = async () => {
      setDataLoadingState('IN-PROGRESS');
      const collectionsToFetch = extractCollectionsFromSections(sections, [
        'highlighted-collections',
        'chip-collections',
      ]);

      try {
        const collectionsData = await fetchHomepageCollectionsData(collectionsToFetch);
        console.log('Finishing carousel data fetch for collections');

        // Convert the results to the format expected by chipCollectionData
        const formattedData = {};
        Object.entries(collectionsData).forEach(([collection, data]) => {
          formattedData[collection] = {
            status: 'loaded',
            products: data.products,
            filters: data.filters,
            selectedFilters: [],
            error: '',
          };
        });

        setChipCollectionData(formattedData);
      } catch (err) {
        console.error('Failed to fetch data for homepage', err);
        const errorMessage = 'Error: ' + err.toString();

        // Create an error state for each collection
        const errorData = {};
        collectionsToFetch.forEach(collection => {
          errorData[collection] = {
            status: 'error',
            products: [],
            filters: [],
            selectedFilters: [],
            error: errorMessage,
          };
        });

        setChipCollectionData(errorData);
      }

      const pageParams = {
        handle: 'app-homepage',
        pageMetafields: [
          {
            key: 'app_top_banner_content',
            namespace: 'custom',
          },
          {
            key: 'app_banner_heading',
            namespace: 'custom',
          },
          {
            key: 'banner_contents',
            namespace: 'custom',
          },
        ],
      };

      try {
        const data = await fetchPageData(pageParams.handle, pageParams.pageMetafields);
        setMetafieldCarousalData(
          extractBannerNavigation(transformPageData(data)),
        );
      } catch (err) {
        console.error('Page data [Marker error]', err);
      }


      setDataLoadingState('DONE');
    }

    loadData();

    loadedRef.current = true;
  }, [sections]);


  const onSelectShade = useCallback(product => {
    setSelectedProduct(product);
    shadeBottomSheetRef.current?.show();
  }, []);

  // Handle Choose Variant button click
  const onSelectVariant = useCallback(product => {
    setSelectedProduct(product);
    variantBottomSheetRef.current?.show();
  }, []);

  // Define sections for SectionList
  // Memoize sections data to prevent unnecessary re-renders
  // const sectionLoadedRef = useRef(false);
  // React.useEffect(() => {
  //   if (!sectionLoadedRef.current) {
  //     sectionLoadedRef.current = true;
  //     console.log('Setting sections for the first time');
  //     setSections(widgetList);
  //   }
  // }, [widgetList]);

  // Render section headers (currently not displaying any headers)
  const renderSectionHeader = ({ section }) => null;

  // Memoize render function to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item, section }) => {
      switch (section.type) {
        case 'metafield-carousel':
          return (
            <MetafieldBannerCarousel
              loading={dataLoadingState !== 'DONE'}
              items={metafieldCarousalData}
              screenWidth={screenWidth}
              onNavigate={(screen, params) =>
                dispatch(navigateToScreen(screen, params))
              }
            />
          );
        case 'banner-carousel':
          return (
            <BannerCarousel
              loading={dataLoadingState !== 'DONE'}
              config={section.config}
              screenWidth={screenWidth}
              onNavigate={(screen, params) =>
                dispatch(navigateToScreen(screen, params))
              }
            />
          );
        case 'quick-collections':
          return <QuickCollections config={section.config} loading={dataLoadingState !== 'DONE'} />;
        case 'highlighted-collections':
          // Get collection from config
          const collectionHandle = section.config?.collection;

          // Check if collection data exists, otherwise show loading or error
          const collectionData = chipCollectionData[collectionHandle] || {
            status: 'notstarted',
            products: [],
            error: '',
          };

          return (
            <WeeklyPicksSection
              config={section.config}
              products={collectionData.products}
              loading={collectionData.status !== 'loaded' || dataLoadingState !== 'DONE'}
              error={collectionData.error}
              onSelectShade={onSelectShade}
              onSelectVariant={onSelectVariant}
            />
          );
        case 'chip-collections':
          // Get collection from config
          const handle = section.config?.collection;

          // Check if collection data exists, otherwise show loading or error
          const data = chipCollectionData[handle] || {
            status: 'notstarted',
            products: [],
            filters: [],
            selectedFilters: [],
            error: '',
          };

          return (
            <ChipCollectionCarousel
              config={section.config}
              numberOfProducts={numberOfProducts}
              data={data}
              onSelectShade={onSelectShade}
              onSelectVariant={onSelectVariant}
              onFilterSelect={onFilterSelect}
              onFilterRemove={onFilterRemove}
              onFilterClear={onClearAllFilters}
              loading={data.status !== 'loaded' || dataLoadingState !== 'DONE'}
            />
          );
        case 'celeb-picks':
          return <CelebPicks config={section.config} loading={dataLoadingState !== 'DONE'} />;
        case 'pilgrim-code':
          return <PilgrimCode loading={dataLoadingState !== 'DONE'} />;
        case 'countdown-timer':
          return <CountdownTimer loading={dataLoadingState !== 'DONE'} config={section.config} />;
        default:
          return null;
      }
    },
    [
      metafieldCarousalData,
      screenWidth,
      dispatch,
      chipCollectionData,
      onSelectShade,
      onSelectVariant,
      onFilterSelect,
      onFilterRemove,
      onClearAllFilters,
      dataLoadingState
    ],
  );

  return (
    <>
      <SectionList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={true}
        // onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        updateCellsBatchingPeriod={50}
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
        optionName={'Size'}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 70
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
});

export const WidgetConfig = {
  quickCollections: [],
  numberOfProducts: '',
  imageCarouselImages: [],
  celebPicksData: [],
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'widgetList',
      props: {
        label: 'Widget List',
      }
    }
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Product Collection Widget',
  defaultProps: {
    collectionHandle: 'bestsellers',
    numberOfProducts: 5,
  },
};


// Need proper loading state for each component
// wait for data to load to open the app seems bad
// section list loading skeleton