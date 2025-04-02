import React from 'react';
import { 
  View, 
  Text,
  Alert
} from 'react-native';
import RelatedProductsCarousel from '../../../../../extractedQueries/RelatedProductsCarousel';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';

const RecommendationsRoot = ({ 
  loading, 
  error, 
  data, 
  handleAddToCart = () => {
    Alert.alert('Success', 'Products added to cart!');
  }
}) => {
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

  // Check if we have the main product, complementary recommendations, and related recommendations
  const mainProduct = data?.data?.productByHandle;
  const complementaryProducts = data?.data?.complementaryRecommendations;
  const relatedProducts = data?.data?.relatedRecommendations;
  
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
      metafield: mainProduct.metafields?.find(m => m?.key === 'product_label_1' && m?.namespace === 'custom')
    },
    // First complementary product
    complementaryProducts[0]
  ];

  return (
    <View>
      <FrequentlyBoughtTogether 
        products={productsToShow}
        onAddToCart={handleAddToCart}
      />
      
      {/* Related Products Carousel */}
      {/* {relatedProducts && relatedProducts.length > 0 && (
        <RelatedProductsCarousel 
          products={relatedProducts}
        />
      )} */}
    </View>
  );
};

export default RecommendationsRoot;
