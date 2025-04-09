import React, {useState, useRef} from 'react';
import { 
  View, 
  Text,
  Alert
} from 'react-native';
import RelatedProductsCarousel, {formatProductsForCarousel} from '../../../../../extractedQueries/RelatedProductsCarousel';
import ShadeSelector from '../../../../../extractedQueries/ShadeSelector';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';
import VariantSelector from '../../../../../extractedQueries/VariantSelector';

function RecommendationsRoot({ 
  loading, 
  error, 
  data, 
  handleAddToCart = () => {
    Alert.alert('Success', 'Products added to cart!');
  }
}) {
  const bottomSheetRef = useRef(null);
  const variantSelectorRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectShade = (product) => {
    setSelectedProduct(product);
    bottomSheetRef.current?.show();
  };

  const handleSelectVariant = product => {
    setSelectedProduct(product);
    variantSelectorRef.current?.show();
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
  const mainProduct = data?.productByHandle;
  const complementaryProduct = data?.complementaryRecommendation;
  const relatedProducts = data?.relatedRecommendations;
  
  if (!mainProduct) {
    return null;
  }

  return (
    <View>
      {complementaryProduct && (
        <FrequentlyBoughtTogether 
          products={[mainProduct, complementaryProduct]}
          onAddToCart={handleAddToCart}
        />
      )}
      
      {/* Related Products Carousel */}
      {relatedProducts && relatedProducts.length > 0 && (
        <>
          <RelatedProductsCarousel 
            title="Customers also liked"
            products={relatedProducts}
            onSelectShade={handleSelectShade}
            onSelectVariant={handleSelectVariant}
          />
          <ShadeSelector 
            bottomSheetRef={bottomSheetRef}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
          <VariantSelector
            product={selectedProduct}
            bottomSheetRef={variantSelectorRef}
            onClose={() => setSelectedProduct(null)}
          />
        </>
      )}
    </View>
  );
};

export default RecommendationsRoot;
