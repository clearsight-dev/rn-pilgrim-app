import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text,
  ScrollView,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel } from 'apptile-core';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';

export function ReactComponent({ model }) {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    if (queryRunner) {
      setLoading(true);
      fetchProductData(queryRunner, "3-redensyl-4-anagain-hair-growth-serum")
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err.toString());
          setError(err.toString());
          setLoading(false);
        });
    }
  }, [shopifyDSModel]);

  // Handle add to cart action
  const handleAddToCart = () => {
    Alert.alert('Success', 'Products added to cart!');
  };

  // If data is still loading, show a loading message
  if (loading) {
    return (
      <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading recommendations...</Text>
      </View>
    );
  }

  // If there was an error, show an error message
  if (error) {
    return (
      <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Error loading recommendations: {error}</Text>
      </View>
    );
  }

  // Check if we have both the main product and complementary recommendations
  const mainProduct = data?.data?.productByHandle;
  const complementaryProducts = data?.data?.relatedRecommendations;
  
  if (!mainProduct) {
    return (
      <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Main product information not available.</Text>
      </View>
    );
  }

  if (!complementaryProducts || complementaryProducts.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text>No complementary products available.</Text>
      </View>
    );
  }

  // Create an array with the main product first, followed by the first complementary product
  const productsToShow = [
    // Main product
    {
      title: mainProduct.title,
      handle: mainProduct.handle,
      featuredImage: mainProduct.images?.edges[0]?.node,
      priceRange: mainProduct.priceRange,
      compareAtPriceRange: mainProduct.compareAtPriceRange,
      metafield: mainProduct.metafields?.find(m => m.key === 'product_label_1' && m.namespace === 'custom')
    },
    // First complementary product
    complementaryProducts[0]
  ];

  return (
    <ScrollView style={{ flex: 1 }}>
      <FrequentlyBoughtTogether 
        products={productsToShow}
        onAddToCart={handleAddToCart}
      />
    </ScrollView>
  );
}

export const WidgetConfig = {
};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};
