import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { navigateToScreen } from 'apptile-core';
import { useDispatch } from 'react-redux';
import Star from '../../../../extractedQueries/Star';
import ProductFlag from '../../../../extractedQueries/ProductFlag';
import {Image} from '../../../../extractedQueries/ImageComponent';

const RelatedProductCard = ({ product, style, loadedProductHandles }) => {
  // Extract product details - use fullData if available (from lazy loading)
  const fullData = product.fullData || {};
  const { 
    title, 
    featuredImage, 
    priceRange, 
    compareAtPriceRange, 
    metafield, 
    handle, 
    rating 
  } = {
    ...product,
    // Override with fullData if available
    ...fullData
  };
  
  // Get price information
  const price = priceRange?.minVariantPrice?.amount || '0';
  const compareAtPrice = compareAtPriceRange?.minVariantPrice?.amount || null;
  
  // Calculate discount percentage if compareAtPrice exists
  const discountPercentage = compareAtPrice 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;
  
  const dispatch = useDispatch();

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={() => {
        dispatch(navigateToScreen('NewPDP', {productHandle: handle}))
      }}
    >
      {/* Promo Tag */}
      <ProductFlag 
        label={metafield?.value || "Buy 3@999"} 
        color="#00726C" 
        style={styles.promoTagContainer}
        textStyle={styles.promoTagText}
        height={18}
        width={95}
      />

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: featuredImage?.url }} 
          style={styles.image}
          resizeMode="contain"
        />
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating || fullData?.rating || '4.8'}</Text>
          <Star color={'#00909E'} size={12} fillPercentage={1} />
        </View>
        
        {/* No loading indicator - optimistic loading */}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={{color: '#F27B58', fontWeight: '600', fontSize: 11}}>BESTSELLER</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.subtitle}>2 Sizes</Text>
        
        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{parseInt(price).toLocaleString()}</Text>
          
          {compareAtPrice && (
            <>
              <Text style={styles.compareAtPrice}>₹{parseInt(compareAtPrice).toLocaleString()}</Text>
              <Text style={styles.discount}>{discountPercentage}% Off</Text>
            </>
          )}
        </View>
      </View>
      <View
        style={{
          paddingHorizontal: 8
        }}
      >
        <TouchableOpacity
          onPress={e => e.stopPropagation()}
          style={{
            height: 33, 
            backgroundColor: '#FACA0C',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500'
            }}
          >
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 184,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 12,
  },
  promoTagContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    zIndex: 1
  },
  promoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600'
  },
  imageContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 24,
    borderColor: '#F3F3F3',
    backgroundColor: 'white'
  },
  ratingText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '600',
    marginRight: 4
  },
  detailsContainer: {
    fontSize: 12,
    color: '#767676',
    fontWeight: '400',
    padding: 12,
    paddingTop: 4
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 18
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 4
  },
  price: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginRight: 4,
  },
  compareAtPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  discount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00909E',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
});

export default RelatedProductCard;
