import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text as RNText } from 'react-native';
import {Image} from '../../../../../extractedQueries/ImageComponent';
import { useApptileWindowDims } from 'apptile-core';
import BenefitsCard from './BenefitsCard';
import ThreeDCarousel from './ThreeDCarousel';
import GradientText from '../../../../../extractedQueries/GradientText';

const BenefitsRoot = ({ 
  loading, 
  error, 
  benefits, 
  backgroundColor = '#C5FAFF4D',
  aspectRatio = '1/1.5',
  cardWidthPercentage = 70,
  cardSpacing = 10,
  imageBand = []
}) => {
  const { width } = useApptileWindowDims();
  
  const ITEM_WIDTH = width * (cardWidthPercentage / 100); // Card width as percentage of screen width
  const SPACING = parseInt(cardSpacing, 10); // Configurable spacing between cards
  
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
      {imageBand.length > 0 && (
        <View 
          style={{
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            paddingVertical: 16,
            paddingHorizontal: 20
          }}
        >
          {imageBand.map((item, index) => {
            return (
              <View key={index} style={{flexDirection: 'row'}}>
                <Image 
                  style={{
                    height: 40, 
                    aspectRatio: 1,
                    marginRight: 8,
                  }}
                  source={{uri: item.urls?.[0]}}
                ></Image>
                <View style={{flexDirection: 'column'}}>
                  <RNText
                    style={{
                      fontSize: 13,
                      fontWeight: '800'
                    }}
                  >
                    {item.heading}
                  </RNText>
                  <RNText>{item.subtitle}</RNText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

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

export default BenefitsRoot;
