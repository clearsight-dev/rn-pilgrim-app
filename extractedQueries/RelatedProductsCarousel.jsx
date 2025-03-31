import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { fetchProductData } from './pdpquery';
import RelatedProductCard from './RelatedProductCard';
import { useShopifyQueryAndAddtoCart } from './selectors';

const RelatedProductsCarousel = ({
  title = "Customers also liked",
  products = [],
  style,
  initialProductsToLoad = 2 // Default to loading 5 products initially
}) => {
  const {queryRunner, addLineItemToCart} = useShopifyQueryAndAddtoCart();

  // Function to fetch product data
  async function cacheProductDetails(productHandle) {
    if (!queryRunner) return;

    try {
      await fetchProductData(queryRunner, productHandle);
    } catch (error) {
      console.error(`Error fetching product ${productHandle}:`, error);
    }
  };

  async function cacheMultipleProducts(products) {
    if (!products || products.length === 0) return;
    for (let i = 0; i < products.length; ++i) {
      await cacheProductDetails(products[i].handle);
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      })
    }
  }

  const handleAddToCart = useCallback((product) => {
    console.log("Adding product: ", product)
    if (addLineItemToCart) {
      addLineItemToCart(product.id);
    } else {
      console.error("no function found for adding to cart!");
    }
  }, [addLineItemToCart]);

  // Initialize with the specified number of products
  useEffect(() => {
    const initialProducts = products.slice(0, Math.min(initialProductsToLoad, products.length));
    cacheMultipleProducts(initialProducts); 
  }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Horizontal Scrollable List */}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        // onScroll={handleScroll}
        onEndDrag={() => cacheMultipleProducts(products)}
        onMomentumScrollEnd={() => cacheMultipleProducts(products)}
        scrollEventThrottle={16}
        renderItem={({ item: product, index }) => (
          <RelatedProductCard
            key={product.handle || index}
            product={product}
            onAddToCart={handleAddToCart}
          />
        )}
        keyExtractor={(product, index) => product.handle || index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 16
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8
  }
});

export default RelatedProductsCarousel;
