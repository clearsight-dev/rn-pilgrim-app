import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text as RNText } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { useSelector } from 'react-redux';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import BenefitsCard from './BenefitsCard';
import ThreeDCarousel from './threeDCarousel';
import GradientText from '../../../../extractedQueries/GradientText';

export function ReactComponent({ model }) {
  const productHandle = model.get('productHandle');
  const backgroundColor = model.get('backgroundColor') || '#C5FAFF4D';
  const aspectRatio = model.get('aspectRatio') || '1/1.5'; // Get aspect ratio from props
  const cardWidthPercentage = parseFloat(model.get('cardWidthPercentage') || '70'); // Get card width as percentage of screen
  const cardSpacing = parseInt(model.get('cardSpacing') || '10', 10); // Get spacing between cards
  
  const [benefits, setBenefits] = useState({
    carouselItems: [],
    title: "",
    benefitsList: [],
    ingredients: {
      title: "",
      images: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useApptileWindowDims();
  
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const queryRunner = shopifyDSModel?.get('queryRunner') || null;

  const ITEM_WIDTH = width * (cardWidthPercentage / 100); // Card width as percentage of screen width
  const SPACING = cardSpacing; // Configurable spacing between cards
  
  // Parse the aspect ratio string (format: "width/height")
  const parseAspectRatio = (ratioStr) => {
    try {
      const [width, height] = ratioStr.split('/').map(num => parseFloat(num));
      return width / height;
    } catch (e) {
      console.error("[APPTILE_AGENT] Error parsing aspect ratio:", e);
      return 1/1.5; // Default fallback
    }
  };

  const cardAspectRatio = parseAspectRatio(aspectRatio);
  
  useEffect(() => {
    debugger
    if (queryRunner && productHandle) {
      fetchProductData(queryRunner, productHandle)
        .then((res) => {
          if (res?.data?.productByHandle?.metafields) {
            const productMetafields = res.data.productByHandle.metafields;
            
            // Extract carousel benefit data from metafields
            const carouselData = productMetafields
              .filter(mf => mf && (
                mf.key === 'test_benefit_url' ||
                mf.key === 'after_atc_benefit2_url' ||
                mf.key === 'after_atc_benefit3_url'
              ))
              .map((mf, index) => {
                return {
                  imageUrl: mf.value
                };
              });
            
            // Extract key benefits title and list for BenefitsCard
            const keyBenefitsTitle = productMetafields.find(field => 
              field?.key?.includes('key_benefits_heading') 
            );
            
            const keyBenefitsList = productMetafields
              .filter(field => field?.key?.includes('key_benefits') && field?.type === 'multi_line_text_field')
              .flatMap(item => item.value.split('•'))
              .filter(line => line.trim() !== ''); // Filter out empty lines

            const ingredients = productMetafields.filter(field => {
              return field?.key?.startsWith('ingredients') && 
                field?.key?.endsWith('_url')
            })
            .map(it => {
              return {
                imageUrl: it.value
              };
            });

            const ingredientsHeading = productMetafields
              .find(it => it?.key === "ingredients_heading")?.value ?? "";
            
            if (carouselData.length > 0) {
              setBenefits({
                carouselItems: carouselData,
                title: keyBenefitsTitle?.value,
                benefitsList: keyBenefitsList,
                ingredients: {
                  title: ingredientsHeading,
                  images: ingredients
                }
              });
              setError(null);
            } else {
              // Fallback if no benefit data is found
              setError("No benefit data found");
            }
          } else {
            setError("No metafields found");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("[APPTILE_AGENT] Query error:", err);
          setError(err);
          setLoading(false);
        });
    } else {
      setError("Query runner not available queryRunner: " + queryRunner + ", handle: " + productHandle);
      setLoading(false);
    }
  }, [queryRunner, productHandle]);


  if (loading) {
    return <ActivityIndicator size="large" color="#4DB6AC" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={{ backgroundColor, paddingVertical: 20 }}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <GradientText
            text="Key Benefits"
            fontSize={32}
            fontWeight="bold"
            width="100%"
            height={60}
            y="40"
          />
        </View>
        <RNText style={styles.errorText}>Error: {error.message || JSON.stringify(error)}</RNText>
      </View>
    );
  }

  if (!benefits.carouselItems || benefits.carouselItems.length === 0) {
    return (
      <View style={{ backgroundColor, paddingVertical: 20 }}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <GradientText
            text="Key Benefits"
            fontSize={32}
            fontWeight="bold"
            width="100%"
            height={60}
            y="40"
          />
        </View>
        <RNText style={styles.errorText}>No benefits data available</RNText>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Benefits Card */}
      {benefits.benefitsList.length > 0 && (
        <BenefitsCard 
          title={benefits.title} 
          benefits={benefits.benefitsList} 
          style={{ marginBottom: 30 }}
        />
      )}
      
      <ThreeDCarousel
        carouselItems={benefits.carouselItems}
        itemWidth={ITEM_WIDTH}
        spacing={SPACING}
        cardAspectRatio={cardAspectRatio}
        width={width}
        backgroundColor={backgroundColor}
        title="Key Benefits"
      />

      <ThreeDCarousel
        carouselItems={benefits.ingredients.images}
        itemWidth={ITEM_WIDTH}
        spacing={SPACING}
        cardAspectRatio={cardAspectRatio}
        width={width}
        backgroundColor={backgroundColor}
        title={benefits.ingredients.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
  }
});

export const WidgetConfig = {
  backgroundColor: '',
  aspectRatio: '',
  cardWidthPercentage: '',
  cardSpacing: '',
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
    },
    {
      type: 'colorInput',
      name: 'backgroundColor',
      props: {
        label: 'Background Color'
      }
    },
    {
      type: 'codeInput',
      name: 'aspectRatio',
      props: {
        label: 'Card Aspect Ratio (width/height)'
      }
    },
    {
      type: 'codeInput',
      name: 'cardWidthPercentage',
      props: {
        label: 'Card Width (% of screen)'
      }
    },
    {
      type: 'codeInput',
      name: 'cardSpacing',
      props: {
        label: 'Spacing Between Cards'
      }
    }
  ]
};

export const WrapperTileConfig = {
  name: "3D Key Benefits Carousel",
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
    }
  },
};

export const PropertySettings = {};
