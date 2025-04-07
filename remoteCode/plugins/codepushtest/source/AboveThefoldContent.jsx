import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ImageCarousel from './ProductCarousel';
import ProductInfo from './ProductInfo';
import AboveThefoldSkeleton from './AboveThefoldSkeleton';

const AboveThefoldContent = ({ 
  loading, 
  error, 
  product, 
  productLabel, 
  offers,
  variants,
  selectedVariant, 
  setSelectedVariant,
  screenWidth
}) => {
  if (loading) {
    return <AboveThefoldSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <ImageCarousel 
        images={product?.images} 
        screenWidth={screenWidth} 
        productLabel={productLabel}
      />
      
      <ProductInfo 
        product={product}
        productLabel={product?.productLabel2?.value || product?.productLabel1?.value || null}
        offers={offers}
        variants={variants}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  }
});

export default AboveThefoldContent;
