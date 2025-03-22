import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useApptileWindowDims } from 'apptile-core';
import ProductCarousel from './ProductCarousel';

export default function TestCarousel() {
  const { width: screenWidth } = useApptileWindowDims();
  
  // Sample product images for testing
  const productImages = [
    'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/lasagne-al-forno-by-adriano-homecooks-952555_480x480.jpg',
    'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/chicken-tagine-by-pessima-homecooks-666220_480x480.jpg',
    'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/caribbean-chicken-curry-by-pessima-homecooks-167185_480x480.jpg',
    'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/malagasy-style-vegetable-curry-by-lilias-kitchen-homecooks-262695_480x480.jpg'
  ];
  
  // Sample product label
  const productLabel = "BESTSELLER";
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProductCarousel 
          images={productImages} 
          screenWidth={screenWidth} 
          productLabel={productLabel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  }
});

// Export for use in widget.jsx
export function ReactComponent() {
  return <TestCarousel />;
}

export const WidgetConfig = {};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Test Carousel with ScrollBubbles',
  defaultProps: {},
};
