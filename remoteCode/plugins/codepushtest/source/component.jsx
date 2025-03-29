
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SectionList, Text, InteractionManager, Platform } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { useRoute } from '@react-navigation/native';
import { useSelector, shallowEqual } from 'react-redux';
import {fetchProductData} from '../../../../extractedQueries/pdpquery';
import AboveThefoldContent from './AboveThefoldContent';
import DescriptionCard from './DescriptionCard';
import RecommendationsRoot from './recommendations/RecommendationsRoot';
import BenefitsRoot from './keybenefits/BenefitsRoot';
import RatingsReviewsRoot from './ratingsAndReviews/RatingsReviewsRoot';

export function ReactComponent({ model }) {
  const route = useRoute();
  const productHandle = route.params?.productHandle ?? '3-redensyl-4-anagain-hair-growth-serum';
  // const productHandle = model.get('productHandle');
  const backgroundColor = model.get('backgroundColor') || '#C5FAFF4D';
  const aspectRatio = model.get('aspectRatio') || '1/1.5';
  const cardWidthPercentage = parseFloat(model.get('cardWidthPercentage') || '70');
  const imageBand = model.get('imageBand') || [];
  const cardSpacing = parseInt(model.get('cardSpacing') || '10', 10);
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [benefits, setBenefits] = useState({
    carouselItems: [],
    title: "",
    benefitsList: [],
    ingredients: {
      title: "",
      images: []
    }
  });
  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();

  const queryRunner = useSelector(state => {
    const shopifyDSModel = datasourceTypeModelSel(state, 'shopifyV_22_10')
    const queryRunner = shopifyDSModel.get('queryRunner');
    return queryRunner;
  }, shallowEqual);

  console.log("Rendering pdp");
  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        if (!queryRunner || !productHandle) {
          // TODO(gaurav): actually retry
          console.error("[APPTILE_AGENT] No query runner or product handle. Will retry in 100ms");
          return;
        }

        const result = await fetchProductData(queryRunner, productHandle);

        // Beware adventurer, wild things follow

        // On low end androids the render cycle is long enough to give a significant
        // pause before navigation if the render starts too early. So we delay here
        // to allow the navigation to finish and let the skeleton show for a bit,
        // before staring the render
        if (Platform.OS === "android") {
          setTimeout(() => {
          // We don't use InteractionManager because that will stop the render from
          // starting while the transition is happening. This introduces a tradeoff
          // between the page transition animation finishing completely but smoothly
          // and the skeleton showing till the render is finished, or there being a 
          // bit of a jank in the page transition animation but the page contents 
          // loading by the time the animation finishes. When loading from apollo cache
          // it looks better IMO when the page loads as the animation finishes, 
          // even if there is a bit of a jank
          // The delay is 50 because its seems to be the optimal choice on xiaomi
          // and pixel 6 to have the jank occur at the last possible moment of the 
          // animation
          // InteractionManager.runAfterInteractions(() => {
            setProductData(result);
            setLoading(false);
          }, 50);
        } else {
          setProductData(result);
          setLoading(false);
        }

      } catch (err) {
        console.error("[APPTILE_AGENT] Error fetching product data:", err);
        setError(err.message || "Failed to fetch product data");
        setLoading(false);
      }
    };
  
    if (queryRunner && productHandle) {
      loadProductData();
    }
  }, [queryRunner, productHandle]);

  // Extract and format product label
  const formatProductLabel = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) return null;
    
    const labelMetafield = metafields.find(meta => 
      meta && meta.key === 'product_label_1' && meta.namespace === 'custom'
    );
    
    if (!labelMetafield || !labelMetafield.value) return null;
    
    // Capitalize and remove non-alphabetical characters
    return labelMetafield.value
      .replace(/[^a-zA-Z ]/g, '')
      .toUpperCase();
  };

  // Parse rating JSON from metafield
  const parseRating = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) return "4.8";
    
    const ratingMetafield = metafields.find(meta => 
      meta && meta.key === 'rating' && meta.namespace === 'reviews'
    );
    
    if (!ratingMetafield || !ratingMetafield.value) return "4.8";
    
    try {
      // Parse the JSON string to get the rating object
      const ratingObj = JSON.parse(ratingMetafield.value);
      // Return the value, or fallback to 4.8 if not found
      return ratingObj.value || "4.8";
    } catch (e) {
      console.error("[APPTILE_AGENT] Error parsing rating JSON:", e);
      return "4.8";
    }
  };

  // Extract offer data from metafields
  const extractOffers = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) return [];
    
    const offerMetafields = metafields.filter(meta => 
      meta && meta.key && meta.key.startsWith('pd_page_offer_') && meta.references && meta.references.nodes
    );
    
    const offers = [];
    
    offerMetafields.forEach(metafield => {
      if (metafield.references && metafield.references.nodes) {
        metafield.references.nodes.forEach(node => {
          if (node && node.fields && Array.isArray(node.fields)) {
            let offer = {};
            
            node.fields.forEach(field => {
              if (field.key === 'offer_headin_1') {
                offer.title = field.value;
              } else if (field.key === 'offer_description_1') {
                offer.description = field.value;
              } else if (field.key === 'offer_code_1') {
                offer.code = field.value;
              }
            });
            
            if (offer.title && offer.description) {
              offers.push(offer);
            }
          }
        });
      }
    });
    
    return offers;
  };

  // Extract product images
  const getProductImages = (product) => {
    if (!product || !product.images || !product.images.edges || !Array.isArray(product.images.edges)) {
      return [];
    }
    
    return product.images.edges
      .filter(edge => edge && edge.node && edge.node.url)
      .map(edge => edge.node.url);
  };

  // Mock variants data - in a real app, you would extract this from the product data
  const variantOptions = [
    { size: "50ml", price: "855", popular: true },
    { size: "30ml", price: "545", popular: false },
    { size: "15ml", price: "159", discount: "4%", originalPrice: "895", popular: false }
  ];
  
  // Extract product details
  const getProductDetails = (data) => {
    if (!data || !data.data || !data.data.productByHandle) {
      return null;
    }
    
    return data.data.productByHandle;
  };
  
  // Process benefits data from metafields
  const processBenefitsData = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) {
      return null;
    }
    
    // Extract carousel benefit data from metafields
    const carouselData = metafields
      .filter(mf => mf && (
        mf.key === 'test_benefit_url' ||
        mf.key === 'after_atc_benefit2_url' ||
        mf.key === 'after_atc_benefit3_url'
      ))
      .map((mf) => {
        return {
          imageUrl: mf.value
        };
      });
    
    // Extract key benefits title and list for BenefitsCard
    const keyBenefitsTitle = metafields.find(field => 
      field?.key?.includes('key_benefits_heading') 
    );
    
    const keyBenefitsList = metafields
      .filter(field => field?.key?.includes('key_benefits') && field?.type === 'multi_line_text_field')
      .flatMap(item => item.value.split('•'))
      .filter(line => line.trim() !== ''); // Filter out empty lines

    const ingredients = metafields.filter(field => {
      return field?.key?.startsWith('ingredients') && 
        field?.key?.endsWith('_url')
    })
    .map(it => {
      return {
        imageUrl: it.value
      };
    });

    const ingredientsHeading = metafields
      .find(it => it?.key === "ingredients_heading")?.value ?? "";
    
    if (carouselData.length > 0) {
      return {
        carouselItems: carouselData,
        title: keyBenefitsTitle?.value,
        benefitsList: keyBenefitsList,
        ingredients: {
          title: ingredientsHeading,
          images: ingredients
        }
      };
    }
    
    return null;
  };
  
  // Main render
  const product = getProductDetails(productData);
  const productImages = product ? getProductImages(product) : [];
  const productLabel = product ? formatProductLabel(product.metafields) : null;
  const rating = product ? parseRating(product.metafields) : "4.8";
  const offers = product ? extractOffers(product.metafields) : [];
  
  // Process benefits data when product data changes
  useEffect(() => {
    if (product && product.metafields) {
      const benefitsData = processBenefitsData(product.metafields);
      if (benefitsData) {
        setBenefits(benefitsData);
      }
    }
  }, [product]);
  
  // Prepare sections for SectionList
  const sections = [
    // Actual content sections
    {
      title: "Product Information",
      type: 'above-the-fold',
      key: 'above-the-fold',
      data: [{}]
    },
    {
      title: "Product Description",
      type: 'description',
      key: 'description',
      data: productData?.data?.productByHandle ? [{}] : []
    },
    {
      title: "Key Benefits",
      type: 'benefits',
      key: 'benefits',
      data: [{}]
    },
    {
      title: "Ratings & Reviews",
      type: 'ratings',
      key: 'ratings',
      data: [{}]
    },
    {
      title: "Recommended Products",
      type: 'recommendations',
      key: 'recommendations',
      data: [{}]
    }
  ];

  // Render section headers
  const renderSectionHeader = ({ section }) => (
    null
    // <View style={styles.sectionHeader}>
    //   <Text style={styles.sectionHeaderText}>{section.title}</Text>
    // </View>
  );

  // Render each section based on its type
  const renderItem = ({ item, section }) => {
    switch (section.type) {
      case 'above-the-fold':
        return (
          <AboveThefoldContent
            loading={loading}
            error={error}
            product={product}
            productImages={productImages}
            productLabel={productLabel}
            rating={rating}
            offers={offers}
            variantOptions={variantOptions}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            screenWidth={screenWidth}
          />
        );
      case 'description':
        return (
          <DescriptionCard 
            productData={productData.data.productByHandle} 
            loading={loading} 
          />
        );
      case 'benefits':
        return (
          <BenefitsRoot
            loading={loading}
            error={error}
            benefits={benefits}
            backgroundColor={backgroundColor}
            aspectRatio={aspectRatio}
            cardWidthPercentage={cardWidthPercentage}
            cardSpacing={cardSpacing}
            imageBand={imageBand}
          />
        );
      case 'ratings':
        return (
          <RatingsReviewsRoot 
            productHandle={productHandle}
          />
        );
      case 'recommendations':
        return (
          <RecommendationsRoot 
            loading={loading}
            error={error}
            data={productData}
            handleAddToCart={() => console.log("adding to cart")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SectionList
      style={[styles.container, { height: screenHeight }]}
      contentContainerStyle={styles.contentContainer}
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item, index) => index.toString()}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={true}
      initialNumToRender={2} // Start with fewer sections for faster initial render
      maxToRenderPerBatch={4} // Render fewer items per batch
      windowSize={5} // Reduce window size for better performance
      removeClippedSubviews={true} // Important for performance
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff'
  },
  sectionHeader: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dummySection: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
    borderRadius: 8,
  },
  dummyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export const WidgetConfig = {
  productHandle: ''
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'productHandle',
      props: {
        label: 'Product Handle'
      }
    }
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Product Detail Page',
  defaultProps: {
    backgroundColor: {
      label: "Background Color",
      defaultValue: "#C5FAFF4D"
    },
    aspectRatio: {
      label: "Card Aspect Ratio",
      defaultValue: "1/1.5"
    },
    cardWidthPercentage: {
      label: "Card Width (% of screen)",
      defaultValue: "70"
    },
    cardSpacing: {
      label: "Spacing Between Cards",
      defaultValue: "20"
    },
    imageBand: {
      label: "Image Band",
      defaultValue: []
    }
  },
};
