import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useApptileWindowDims } from 'apptile-core';
import ThreeDProductCarousel from './ThreeDProductCarousel';
import { formatProductsForCarousel } from '../../../../../extractedQueries/RelatedProductsCarousel';
import { addLineItemToCart } from '../../../../../extractedQueries/selectors';

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
  cardSpacing = 10
}) {
  const { width } = useApptileWindowDims();
  
  // Calculate dimensions
  const ITEM_WIDTH = width * (cardWidthPercentage / 100);
  const SPACING = parseInt(cardSpacing, 10);

  // Format products for the carousel
  const formattedProducts = formatProductsForCarousel(products);

  // Handlers for product interactions
  const handleAddToCart = useCallback((product) => {
    console.log('Adding to cart:', product.title);
    // Implement your add to cart logic here
  }, []);

  const handleSelectShade = useCallback((product) => {
    console.log('Selecting shade for:', product.title);
    // Implement your shade selection logic here
  }, []);

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
        onAddToCart={product => addLineItemToCart(product.firstVariantId)}
        onSelectShade={handleSelectShade}
        loading={loading}
      />
    </View>
  );
};

export default WeeklyPicksSection;
