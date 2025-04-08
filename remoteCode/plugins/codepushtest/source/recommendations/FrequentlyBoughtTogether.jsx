import React, {Fragment, useEffect, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

const FrequentlyBoughtTogether = ({ 
  title = "Frequently bought together",
  description = "Bundle your purchase with a product frequently bought with this one.",
  products = [],
  onAddToCart,
  style
}) => {
  
  // Calculate total price and savings
  const totalOriginalPrice = products.reduce((sum, product) => {
    return sum + parseFloat(product.compareAtPrice?.amount || 0);
  }, 0);

  const totalDiscountedPrice = products.reduce((sum, product) => {
    return sum + parseFloat(product.price?.amount || 0);
  }, 0);

  const totalSavings = totalOriginalPrice - totalDiscountedPrice;

  return (
    <View style={[styles.container, style]}>
      {/* Title and Description */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {/* Products Row */}
      <View style={styles.productsContainer}>
        {products.map((product, index) => (
          <Fragment key={product.handle || index}>
            {/* Add plus sign between products */}
            {index > 0 && (
              <View style={styles.plusContainer}>
                <Text style={styles.plusSign}>+</Text>
              </View>
            )}
            
            {/* Product Card */}
            <ProductCard product={product} isPressable={index > 0} />
          </Fragment>
        ))}
      </View>

      {/* Price and Add to Cart Section */}
      <View style={styles.priceSection}>
        <View>
          <Text style={styles.totalPriceLabel}>Total Price: <Text style={styles.totalPrice}>₹{Math.round(totalDiscountedPrice).toLocaleString()}</Text></Text>
          {totalSavings > 0 && (
            <Text style={styles.savingsText}>
              <Text style={styles.originalPrice}>₹{Math.round(totalOriginalPrice).toLocaleString()}</Text>
              {' '}Save ₹{Math.round(totalSavings).toLocaleString()}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={onAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>Add both to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  productsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'nowrap',
  },
  plusContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    flexShrink: 1
  },
  plusSign: {
    fontSize: 24,
    fontWeight: '300',
    color: '#666666',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#333333',
  },
  totalPrice: {
    fontWeight: '700',
    fontSize: 16,
  },
  savingsText: {
    fontSize: 12,
    color: '#00909E',
    marginTop: 4,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  addToCartButton: {
    backgroundColor: '#FFC700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FrequentlyBoughtTogether;
