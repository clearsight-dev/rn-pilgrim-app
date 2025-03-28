import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel } from 'apptile-core';
import { fetchProductData } from './pdpquery';
import RelatedProductCard from './RelatedProductCard';
import { debounce } from 'lodash-es';

const RelatedProductsCarousel = ({
  title = "Customers also liked",
  products = [],
  style,
  initialProductsToLoad = 5 // Default to loading 5 products initially
}) => {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loadedProductHandles, setLoadedProductHandles] = useState(new Set());
  const [isScrolling, setIsScrolling] = useState(false);
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));

  // Function to fetch product data
  const fetchProductDetails = async (productHandle) => {
    if (!shopifyDSModel || loadedProductHandles.has(productHandle)) return;

    try {
      const queryRunner = shopifyDSModel?.get('queryRunner');
      const result = await fetchProductData(queryRunner, productHandle);

      // Mark this product as loaded
      setLoadedProductHandles(prev => new Set([...prev, productHandle]));

      // Update the product in the visibleProducts array
      setVisibleProducts(prev =>
        prev.map(product =>
          product.handle === productHandle
            ? { ...product, fullData: result.data.productByHandle }
            : product
        )
      );
    } catch (error) {
      console.error(`Error fetching product ${productHandle}:`, error);
    }
  };

  // Create a debounced version of the fetch function
  const debouncedFetchProducts = useRef(
    debounce((productsToFetch) => {
      productsToFetch.forEach(product => {
        fetchProductDetails(product.handle);
      });
    }, 1000)
  ).current;

  // Handle scroll events
  const handleScroll = (event) => {
    setIsScrolling(true);

    // When scroll ends, trigger the debounced fetch
    debouncedFetchProducts(visibleProducts);
  };

  // Initialize with the specified number of products
  useEffect(() => {
    if (!products || products.length === 0) return;

    // Initialize with all products but only mark the initial number for loading
    setVisibleProducts(products);

    // Set a timeout to fetch the initial products after 1 second
    const timer = setTimeout(() => {
      const initialProductsToLoad = products.slice(0, Math.min(initialProductsToLoad, products.length));
      debouncedFetchProducts(initialProductsToLoad);
    }, 1000);

    return () => {
      clearTimeout(timer);
      debouncedFetchProducts.cancel();
    };
  }, [products, initialProductsToLoad]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Horizontal Scrollable List */}
      <FlatList
        data={visibleProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        // onScroll={handleScroll}
        // onEndDrag={() => setIsScrolling(false)}
        // onMomentumScrollEnd={() => setIsScrolling(false)}
        // scrollEventThrottle={16}
        renderItem={({ item: product, index }) => (
          <RelatedProductCard
            key={product.handle || index}
            product={product}
            loadedProductHandles={loadedProductHandles}
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
