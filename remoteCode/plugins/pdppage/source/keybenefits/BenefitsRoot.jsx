import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text as RNText } from 'react-native';
import {Image} from '../../../../../extractedQueries/ImageComponent';
import { useApptileWindowDims } from 'apptile-core';
import ThreeDCarousel from './ThreeDCarousel';
import GradientText from '../../../../../extractedQueries/GradientText';
function BenefitsRoot({ 
  loading, 
  error, 
  backgroundColor = '#C5FAFF4D',
  cardWidthPercentage = 70,
  cardSpacing = 10,
  images,
  title
}) { 
  const { width } = useApptileWindowDims();
  
  const ITEM_WIDTH = width * (cardWidthPercentage / 100); // Card width as percentage of screen width
  const SPACING = parseInt(cardSpacing, 10); // Configurable spacing between cards
  
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

  return (
    <View style={styles.mainContainer}>
      <ThreeDCarousel
        carouselItems={images}
        itemWidth={ITEM_WIDTH}
        spacing={SPACING}
        cardAspectRatio={1/1.5}
        width={width}
        backgroundColor={backgroundColor}
        title={title}
      />
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
