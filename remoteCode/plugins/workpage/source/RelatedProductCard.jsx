import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { navigateToScreen } from 'apptile-core';
import { useDispatch } from 'react-redux';

const RelatedProductCard = ({ product, style }) => {
  // Extract product details
  const { title, featuredImage, priceRange, compareAtPriceRange, metafield, handle, rating } = product;
  
  // Get price information
  const price = priceRange?.minVariantPrice?.amount || '0';
  const compareAtPrice = compareAtPriceRange?.minVariantPrice?.amount || null;
  
  // Calculate discount percentage if compareAtPrice exists
  const discountPercentage = compareAtPrice 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;
  
  // Get product label from metafield
  const productLabel = metafield?.value || '';
  const dispatch = useDispatch();

  // Determine if product is a bestseller (this could be based on a tag or metafield)
  const isBestseller = true; // For demo purposes, marking all as bestsellers

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={() => {
        dispatch(navigateToScreen('NewPDP', {productHandle: handle}))
      }}
    >
      {/* Promo Tag */}
      <View style={styles.promoTagContainer}>
        <Text style={styles.promoTagText}>Buy 3@999</Text>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: featuredImage?.url }} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{rating || '4.8'} ★</Text>
      </View>

      {/* Bestseller Label */}
      {isBestseller && (
        <Text style={styles.bestsellerLabel}>BESTSELLER</Text>
      )}
      
      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.subtitle}>{productLabel}</Text>
        
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  promoTagContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#00909E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 1,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  },
  promoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600'
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
  image: {
    width: '100%',
    height: '100%'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8
  },
  ratingText: {
    fontSize: 12,
    color: '#00909E',
    fontWeight: '600'
  },
  bestsellerLabel: {
    fontSize: 10,
    color: '#FF6B00',
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 4
  },
  detailsContainer: {
    padding: 12,
    paddingTop: 4
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
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
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
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
});

export default RelatedProductCard;
