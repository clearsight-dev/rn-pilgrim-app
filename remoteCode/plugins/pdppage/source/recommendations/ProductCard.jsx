import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import {Image} from '../../../../../extractedQueries/ImageComponent';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
import { useDispatch } from 'react-redux';
import { colors, FONT_FAMILY } from '../../../../../extractedQueries/theme';

function ProductCard({ product, style, isPressable = false }) {
  // Extract product details
  const { title, featuredImage, price: priceMoney, compareAtPrice: compareAtPriceMoney, metafield, handle } = product;
  const {width: screenWidth} = useApptileWindowDims();
  
  // Get price information
  const price = parseFloat(priceMoney?.amount ?? 0);
  const compareAtPrice = parseFloat(compareAtPriceMoney?.amount ?? 0);
  
  // Calculate discount percentage if compareAtPrice exists
  const discountPercentage = compareAtPrice 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;
  
  // Get product label from metafield
  const productLabel = metafield?.value || '';
  const dispatch = useDispatch();

  return (
    <Pressable 
      style={({pressed}) => [
        styles.container, 
        style, 
        { width: screenWidth / 2.4 },
        pressed && isPressable && {opacity: 0.5}
      ]}
      onPress={() => {
        dispatch(navigateToScreen('Product', {productHandle: handle}))
      }}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: featuredImage?.url }} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.label}>{productLabel}</Text>
        <View style={{flexGrow: 1}}></View>
        
        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{parseInt(price)}</Text>
          
          {(compareAtPrice && discountPercentage > 0) && (
            <>
              <Text style={styles.compareAtPrice}>₹{parseInt(compareAtPrice)}</Text>
              <Text style={styles.discount}>{discountPercentage}% Off</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#00000020',
    borderRadius: 8,
    overflow: 'hidden',
    flexGrow: 1,
    alignSelf: "stretch",
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: colors.dark70,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  image: {
    width: '100%',
    aspectRatio: 1
  },
  detailsContainer: {
    paddingVertical: 8,
    flexGrow: 1
  },
  title: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    color: colors.dark90,
    marginBottom: 4,
  },
  label: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: colors.dark70,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: colors.dark90,
    marginRight: 4,
  },
  compareAtPrice: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: colors.dark20,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  discount: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    color: colors.secondaryMain,
  },
});

export default ProductCard;
