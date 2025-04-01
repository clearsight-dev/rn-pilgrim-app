import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel } from 'apptile-core';
import BottomSheet from '../../../../../extractedQueries/BottomSheet';
import { colorSwatches, imageSwatches } from '../../../../../extractedQueries/colorswatchinfo';
import { fetchVariantBySelectedOptions } from '../../../../../extractedQueries/collectionqueries';

const ShadeSelector = ({ 
  bottomSheetRef, 
  product, 
  onAddToCart 
}) => {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [selectedShade, setSelectedShade] = useState(null);
  const [shades, setShades] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [colorOption, setColorOption] = useState(null);
  const originalBottomSheetRef = useRef(bottomSheetRef);

  // Reset state when modal is closed
  useEffect(() => {
    // Store the original ref
    originalBottomSheetRef.current = bottomSheetRef;
    
    // Add a custom hide method that resets state
    const originalHide = bottomSheetRef.current?.hide;
    if (bottomSheetRef.current && originalHide) {
      bottomSheetRef.current.hide = () => {
        // Call the original hide method
        originalHide();
        // Reset state
        setSelectedShade(null);
        setSelectedVariant(null);
        setSelectedVariantId(null);
      };
    }
    
    // Cleanup function to restore original hide method
    return () => {
      if (bottomSheetRef.current && originalBottomSheetRef.current) {
        bottomSheetRef.current.hide = originalBottomSheetRef.current.hide;
      }
    };
  }, [bottomSheetRef]);

  // Process product options to get shade data
  useEffect(() => {
    if (!product) return;
    
    // Find the color option
    const option = product.options?.find(option => 
      option.name.toLowerCase() === 'color' || 
      option.name.toLowerCase() === 'shade' || 
      option.name.toLowerCase() === 'colour'
    );
    
    if (!option) return;
    
    setColorOption(option);
    
    // Process each color value
    const processedShades = option.values.map((value, index) => {
      // Normalize the color name (remove non-alphanumeric chars, replace with spaces, condense spaces)
      const normalizedName = value.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Find matching variant
      const variant = product.variants?.find(v => 
        v.selectedOptions?.some(opt => 
          opt.name.toLowerCase() === option.name.toLowerCase() && 
          opt.value === value
        )
      );
      
      // Try to find color in colorSwatches
      let colorHex = null;
      if (colorSwatches[normalizedName]) {
        colorHex = colorSwatches[normalizedName].colorHex;
      }
      
      // If no color found, try to find image in imageSwatches
      let imageUrl = null;
      if (!colorHex && imageSwatches[normalizedName]) {
        imageUrl = imageSwatches[normalizedName];
      }
      
      // If still no image, use variant image
      if (!imageUrl && variant?.image?.url) {
        imageUrl = variant.image.url;
      }
      
      return {
        id: index.toString(),
        name: value,
        normalizedName,
        colorHex,
        imageUrl,
        variantId: variant?.id
      };
    });
    
    setShades(processedShades);
    
    // Select the first shade by default when product changes
    if (processedShades.length > 0) {
      setSelectedShade(processedShades[0]);
    }
  }, [product]);

  // Fetch variant details when a shade is selected
  useEffect(() => {
    if (!selectedShade || !product || !colorOption) return;
    
    const fetchVariantDetails = async () => {
      // Only show loading after 200ms to avoid flicker for cached data
      const loadingTimer = setTimeout(() => {
        setLoadingVariant(true);
      }, 200);
      
      try {
        const queryRunner = shopifyDSModel?.get('queryRunner');
        if (!queryRunner) {
          throw new Error('Query runner not available');
        }
        
        const selectedOptions = [{
          name: colorOption.name,
          value: selectedShade.name
        }];
        
        const result = await fetchVariantBySelectedOptions(
          queryRunner,
          product.handle,
          selectedOptions
        );
        
        const variant = result.data.variant;
        if (variant) {
          setSelectedVariant(variant);
          setSelectedVariantId(variant.id);
        } else {
          // Fallback to the variant ID we already have
          setSelectedVariantId(selectedShade.variantId || product.firstVariantId);
        }
      } catch (error) {
        console.error('Error fetching variant details:', error);
        // Fallback to the variant ID we already have
        setSelectedVariantId(selectedShade.variantId || product.firstVariantId);
      } finally {
        clearTimeout(loadingTimer);
        setLoadingVariant(false);
      }
    };
    
    fetchVariantDetails();
  }, [selectedShade, product, colorOption, shopifyDSModel]);

  const handleAddToCart = () => {
    if (selectedVariantId && onAddToCart) {
      onAddToCart(selectedVariantId);
      // Don't hide the modal or reset the selection
    }
  };

  return (
    <BottomSheet 
      ref={bottomSheetRef}
      title={product?.title || "Select Shade"}
      sheetHeight={0.8} // 80% of screen height
    >
      {product && (
        <View style={styles.bottomSheetContent}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            {loadingVariant ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00909E" />
              </View>
            ) : (
              <>
                <Image 
                  source={{ uri: selectedVariant?.image?.url || product.featuredImage?.url }} 
                  style={styles.productImage}
                  resizeMode="contain"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {selectedVariant?.title || product.title}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₹{parseInt(selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount || 0).toLocaleString()}
                  </Text>
                  {selectedVariant?.weight > 0 && (
                    <Text style={styles.productWeight}>
                      {selectedVariant.weight} {selectedVariant.weightUnit.toLowerCase()}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Shade Selection */}
          <Text style={styles.sectionTitle}>Select Shade</Text>
          <FlatList
            data={shades}
            numColumns={4}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.shadeGrid}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.shadeItem}
                onPress={() => setSelectedShade(item)}
              >
              {item.colorHex ? (
                <View style={[
                  styles.shadeCircle, 
                  { backgroundColor: item.colorHex },
                  selectedShade?.id === item.id && styles.selectedShadeCircle
                ]} />
              ) : item.imageUrl ? (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={[
                    styles.shadeImage,
                    selectedShade?.id === item.id && styles.selectedShadeCircle
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[
                  styles.shadeCircle, 
                  { backgroundColor: '#CCCCCC' },
                  selectedShade?.id === item.id && styles.selectedShadeCircle
                ]} />
              )}
                <Text style={[
                  styles.shadeName,
                  selectedShade?.id === item.id && styles.selectedShadeName
                ]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          
          {/* Add to Cart Button */}
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              !selectedShade && styles.addToCartButtonDisabled
            ]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>
              {selectedShade ? "Add to Cart" : "Select a Shade"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    padding: 16,
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    height: 180,
    aspectRatio: 1,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 14,
    color: '#666666',
  },
  loadingContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  shadeGrid: {
    paddingBottom: 16,
  },
  shadeItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  shadeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  shadeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  shadeName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#FACA0C',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  selectedShadeCircle: {
    borderWidth: 2,
    borderColor: '#00909E',
    transform: [{ scale: 1.1 }]
  },
  selectedShadeName: {
    color: '#00909E',
    fontWeight: '600'
  }
});

export default ShadeSelector;
