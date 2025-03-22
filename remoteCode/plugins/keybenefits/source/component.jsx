import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Animated, Text as RNText } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { useSelector } from 'react-redux';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import { Svg, Defs, LinearGradient, Stop, Text } from 'react-native-svg';
import BenefitsCard from './BenefitsCard';

export function ReactComponent({ model }) {
  const productHandle = '3-redensyl-4-anagain-hair-growth-serum'; // Hardcoded product handle
  const backgroundColor = model.get('backgroundColor') || '#C5FAFF4D';
  const aspectRatio = model.get('aspectRatio') || '1/1.5'; // Get aspect ratio from props
  const cardWidthPercentage = parseFloat(model.get('cardWidthPercentage') || '70'); // Get card width as percentage of screen
  const cardSpacing = parseInt(model.get('cardSpacing') || '10', 10); // Get spacing between cards
  
  const [benefits, setBenefits] = useState({
    carouselItems: [],
    title: "",
    benefitsList: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useApptileWindowDims();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
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
    if (queryRunner) {
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
              field?.key?.includes('key_benefits') && field?.type === 'single_line_text_field'
            );
            
            const keyBenefitsList = productMetafields
              .filter(field => field?.key?.includes('key_benefits') && field?.type === 'multi_line_text_field')
              .flatMap(item => item.value.split('•'))
              .filter(line => line.trim() !== ''); // Filter out empty lines
            
            if (carouselData.length > 0) {
              setBenefits({
                carouselItems: carouselData,
                title: keyBenefitsTitle?.value || "Why you'll love it?",
                benefitsList: keyBenefitsList
              });
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
      setError("Query runner not available");
      setLoading(false);
    }
  }, [queryRunner]);

  useEffect(() => {
    // Center the carousel on the middle item initially
    if (flatListRef.current && benefits.carouselItems.length > 0) {
      const centerIndex = Math.floor(benefits.carouselItems.length / 2);
      const offset = centerIndex * (ITEM_WIDTH + SPACING);
      flatListRef.current.scrollToOffset({
        offset,
        animated: false,
      });
      scrollX.setValue(offset);
    }
  }, [benefits, ITEM_WIDTH, SPACING]);

  if (loading) {
    return <ActivityIndicator size="large" color="#4DB6AC" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.svgContainer}>
          <Svg width="100%" height="60">
            <Defs>
              <LinearGradient id="titleGradient" x1="0" y1="0" x2="100%" y2="0">
                <Stop offset="0%" stopColor="#009FAD" />
                <Stop offset="25%" stopColor="#00707A" />
                <Stop offset="50%" stopColor="#009FAD" />
                <Stop offset="75%" stopColor="#00707A" />
                <Stop offset="100%" stopColor="#009FAD" />
              </LinearGradient>
            </Defs>
            <Text
              fill="url(#titleGradient)"
              fontSize="32"
              fontWeight="bold"
              x="50%"
              y="40"
              textAnchor="middle"
            >
              Key Benefits
            </Text>
          </Svg>
        </View>
        <RNText style={styles.errorText}>Error: {error.message || JSON.stringify(error)}</RNText>
      </View>
    );
  }

  if (!benefits.carouselItems || benefits.carouselItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.svgContainer}>
          <Svg width="100%" height="60">
            <Defs>
              <LinearGradient id="titleGradient" x1="0" y1="0" x2="100%" y2="0">
                <Stop offset="0%" stopColor="#009FAD" />
                <Stop offset="25%" stopColor="#00707A" />
                <Stop offset="50%" stopColor="#009FAD" />
                <Stop offset="75%" stopColor="#00707A" />
                <Stop offset="100%" stopColor="#009FAD" />
              </LinearGradient>
            </Defs>
            <Text
              fill="url(#titleGradient)"
              fontSize="32"
              fontWeight="bold"
              x="50%"
              y="40"
              textAnchor="middle"
            >
              Key Benefits
            </Text>
          </Svg>
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
      
      {/* Key Benefits Section with background color */}
      <View style={[styles.container, { backgroundColor }]}>
        {/* SVG Gradient Title */}
        <View style={styles.svgContainer}>
          <Svg width="100%" height="60">
            <Defs>
              <LinearGradient id="titleGradient" x1="0" y1="0" x2="100%" y2="0">
                <Stop offset="0%" stopColor="#009FAD" />
                <Stop offset="25%" stopColor="#00707A" />
                <Stop offset="50%" stopColor="#009FAD" />
                <Stop offset="75%" stopColor="#00707A" />
                <Stop offset="100%" stopColor="#009FAD" />
              </LinearGradient>
            </Defs>
            <Text
              fill="url(#titleGradient)"
              fontSize="32"
              fontWeight="bold"
              x="50%"
              y="40"
              textAnchor="middle"
            >
              Key Benefits
            </Text>
          </Svg>
        </View>
        
        <Animated.FlatList
          ref={flatListRef}
          data={benefits.carouselItems}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: (width - ITEM_WIDTH) / 2,
          }}
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            // Calculate the input range for animations
            const inputRange = [
              (index - 1) * (ITEM_WIDTH + SPACING),
              index * (ITEM_WIDTH + SPACING),
              (index + 1) * (ITEM_WIDTH + SPACING)
            ];
            
            // Calculate dynamic scale based on scroll position
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.7, 1, 0.7],
              extrapolate: 'clamp'
            });
            
            // Calculate dynamic translateY based on scroll position
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [20, 0, 20],
              extrapolate: 'clamp'
            });
            
            // Calculate dynamic opacity based on scroll position
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.7, 1, 0.7],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View 
                style={[
                  styles.slideContainer,
                  {
                    width: ITEM_WIDTH,
                    marginHorizontal: SPACING / 4,
                    transform: [{ scale }, { translateY }],
                    opacity,
                  }
                ]}
              >
                <View style={[styles.benefitCard, { aspectRatio: cardAspectRatio }]}>
                  <Animated.Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.benefitImage} 
                    resizeMode="contain" 
                  />
                </View>
              </Animated.View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  container: {
    paddingVertical: 20,
  },
  svgContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCard: {
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  benefitImage: {
    width: '100%',
    height: '100%',
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
};

export const WidgetEditors = {
  basic: [
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
