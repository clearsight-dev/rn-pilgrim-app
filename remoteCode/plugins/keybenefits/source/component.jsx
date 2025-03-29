import React, { useEffect, useState } from 'react';
import { datasourceTypeModelSel } from 'apptile-core';
import { useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import BenefitsRoot from './BenefitsRoot';

export function ReactComponent({ model }) {
  const route = useRoute();
  const productHandle = route.params.productHandle;
  const backgroundColor = model.get('backgroundColor') || '#C5FAFF4D';
  const aspectRatio = model.get('aspectRatio') || '1/1.5'; // Get aspect ratio from props
  const cardWidthPercentage = parseFloat(model.get('cardWidthPercentage') || '70'); // Get card width as percentage of screen
  const imageBand = model.get('imageBand') || [];
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
  
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const queryRunner = shopifyDSModel?.get('queryRunner') || null;
  
  useEffect(() => {
    let timeout;
    
    if (queryRunner && productHandle) {
      timeout = setTimeout(() => {
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
      }, 500);
    } else {
      setError("Query runner not available queryRunner: " + queryRunner + ", handle: " + productHandle);
      setLoading(false);
    }
    return () => clearTimeout(timeout);
  }, [queryRunner, productHandle]);

  // Return the BenefitsRoot component with all the necessary props
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
}


export const WidgetConfig = {
  cardWidthPercentage: '',
  cardSpacing: '',
  productHandle: '',
  imageBand: []
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
    },
    {
      type: 'customData',
      name: 'imageBand',
      props: {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            fields: {
              urls: {type: 'image'},
              heading: {type: 'string'},
              subtitle: {type: 'string'}
            }
          }
        }
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
