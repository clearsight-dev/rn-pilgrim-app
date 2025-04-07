import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useApptileWindowDims } from 'apptile-core';
import ThreeDProductCarousel from './ThreeDProductCarousel';
import { formatProductsForCarousel } from '../../../../../extractedQueries/RelatedProductsCarousel';

/**
 * WeeklyPicksSection - A component that displays a 3D carousel of product recommendations
 * 
 * @param {Object} props
 * @param {Array} props.products - Array of product data from API
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error object if any
 * @param {number} props.cardWidthPercentage - Width of cards as percentage of screen width
 * @param {number} props.cardSpacing - Spacing between cards in pixels
 */
function WeeklyPicksSection ({ 
  products = [],
  loading = false,
  error = null,
  cardWidthPercentage = 70,
  cardSpacing = 10,
  onSelectShade,
  onSelectVariant
}) {
  const { width } = useApptileWindowDims();
  
  // Calculate dimensions
  const ITEM_WIDTH = width * (cardWidthPercentage / 100);
  const SPACING = parseInt(cardSpacing, 10);

  // Format products for the carousel
  const formattedProducts = formatProductsForCarousel(products);

  if (error || !formattedProducts) {
    return null; // Or an error message
  }

  return (
    <View style={{width}}>
      <ThreeDProductCarousel
        products={formattedProducts}
        itemWidth={ITEM_WIDTH}
        spacing={SPACING}
        width={width}
        onSelectShade={onSelectShade}
        onSelectVariant={onSelectVariant}
        loading={loading}
      />
    </View>
  );
};

export default WeeklyPicksSection;
