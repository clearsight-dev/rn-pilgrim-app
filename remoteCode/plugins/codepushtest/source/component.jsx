
import React, { useEffect, useState } from 'react';
import { StyleSheet, SectionList, Platform, Text } from 'react-native';
import { useApptileWindowDims } from 'apptile-core';
import { useRoute } from '@react-navigation/native';
import {fetchProductData} from '../../../../extractedQueries/pdpquery';
import AboveThefoldContent from './AboveThefoldContent';
import DescriptionCard from './DescriptionCard';
import RecommendationsRoot from './recommendations/RecommendationsRoot';
import BenefitsRoot from './keybenefits/BenefitsRoot';
import RatingsReviewsRoot from './ratingsAndReviews/RatingsReviewsRoot';
import { formatProduct } from '../../../../extractedQueries/RelatedProductsCarousel';
import { fetchProductOptions } from '../../../../extractedQueries/collectionqueries';

async function getVariants(product, setVariants, setSelectedVariant) {
  const res = await fetchProductOptions(product.handle, product.variantsCount);
  const options = res?.options ?? [];
  const variants = res?.variants ?? [];

  const option = options[0];

  if (!option) return;

  let processedVariants = [];
  for (let index = 0; index < option.optionValues.length; ++index) {
    const value = option.optionValues[index];
    const variant = variants.find(it => {
      return it?.node?.selectedOptions?.[0]?.value === value.name;
    })

    if (variant) {
      processedVariants.push(variant.node);
    }
  }

  setVariants(processedVariants);
  setSelectedVariant(processedVariants[0]);
}

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
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
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

  console.log("Rendering pdp");
  useEffect(() => {
    const loadProductData = async () => {
      const timeout = setTimeout(() => {
        setLoading(true);
      }, 100);

      try {
        if (!productHandle) {
          // TODO(gaurav): actually retry
          console.error("[APPTILE_AGENT] No product handle.");
          return;
        }

        const result = await fetchProductData(productHandle);

        function startHeavyRendering() {
          clearTimeout(timeout);
          const productByHandle = formatProduct(result.productByHandle)
          setProductData({
            productByHandle
          });
          setLoading(false);
          getVariants(productByHandle, setVariants, setSelectedVariant);
        }

        if (Platform.OS === "android") {
          setTimeout(() => {
            startHeavyRendering();
          }, 50);
        } else {
          startHeavyRendering();
        }

      } catch (err) {
        console.error("[APPTILE_AGENT] Error fetching product data:", err);
        setError(err.message || "Failed to fetch product data");
        clearTimeout(timeout);
        setLoading(false);
      }
    };
  
    if (productHandle) {
      loadProductData();
    }
  }, [productHandle]);

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
            product={productData?.productByHandle}
            variants={variants}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            screenWidth={screenWidth}
          />
        );
      case 'description':
        return (
          <DescriptionCard 
            productData={productData?.productByHandle} 
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
    <>
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
    </>
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
