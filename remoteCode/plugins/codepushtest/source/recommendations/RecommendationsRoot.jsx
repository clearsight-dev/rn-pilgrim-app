import React, {useState, useRef} from 'react';
import { 
  View, 
  Text,
  Alert
} from 'react-native';
import RelatedProductsCarousel, {formatProductsForCarousel} from '../../../../../extractedQueries/RelatedProductsCarousel';
import ShadeSelector from '../../../../../extractedQueries/ShadeSelector';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';

function RecommendationsRoot({ 
  loading, 
  error, 
  data, 
  handleAddToCart = () => {
    Alert.alert('Success', 'Products added to cart!');
  }
}) {
  const bottomSheetRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectShade = (product) => {
    setSelectedProduct(product);
    bottomSheetRef.current?.show();
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

  // Check if we have the main product, complementary recommendations, and related recommendations
  const mainProduct = data?.data?.productByHandle;
  const complementaryProducts = formatProductsForCarousel(data?.data?.complementaryRecommendations);
  const relatedProducts = formatProductsForCarousel(data?.data?.relatedRecommendations);
  
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
  const productsToShow = formatProductsForCarousel([
    // Main product
    mainProduct,
    // First complementary product
    complementaryProducts[0]
  ]);

  return (
    <View>
      <FrequentlyBoughtTogether 
        products={productsToShow}
        onAddToCart={handleAddToCart}
      />
      
      {/* Related Products Carousel */}
      {relatedProducts && relatedProducts.length > 0 && (
        <RelatedProductsCarousel 
          title=""
          products={relatedProducts}
          onSelectShade={handleSelectShade}
        />
      )}
      <ShadeSelector 
        bottomSheetRef={bottomSheetRef}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
};

export default RecommendationsRoot;
