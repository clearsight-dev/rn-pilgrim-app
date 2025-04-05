import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, useApptileWindowDims, Icon } from 'apptile-core';
import BottomSheet from './BottomSheet';
import { colorSwatches, imageSwatches } from './colorswatchinfo';
import { fetchProductOptions, fetchVariantBySelectedOptions } from './collectionqueries';

const ShadeSelector = ({ 
  bottomSheetRef, 
  product, 
  onAddToCart 
}) => {
  const [selectedShade, setSelectedShade] = useState(null);
  const [shades, setShades] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const originalBottomSheetRef = useRef(bottomSheetRef);
  const {width: screenWidth} = useApptileWindowDims();

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

    async function getShades() {
      const res = await fetchProductOptions(product.handle);
      const options = res?.data?.options ?? [];

      // Find the color option
      const option = options?.find(option => 
        option.name.toLowerCase() === 'color' 
      );
      
      if (!option) return;

      const normalizeOption = (value) => {
        return value?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Process each color value
      const processedShades = option.optionValues.map((value, index) => {
        // Normalize the color name (remove non-alphanumeric chars, replace with spaces, condense spaces)
        const normalizedName = normalizeOption(value.name);
        
        // Find matching variant
        const variant = product.variants[0];
        
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
          name: value.name,
          normalizedName,
          colorHex,
          imageUrl,
          variantId: variant?.id
        };
      });
      
      setShades(processedShades);
      
      // Select the first shade by default when product changes
      if (Array.isArray(product.variants[0]?.selectedOptions)) {
        const selectedOption = product.variants[0].selectedOptions[0];
        const selectedShadeIndex = processedShades.find(it => it.name === selectedOption.value)
        if (selectedShadeIndex >= 0) {
          setSelectedShade(selectedShadeIndex);
        }
      }
    }

    getShades();
  }, [product]);

  // Fetch variant details when a shade is selected
  useEffect(() => {
    if (!selectedShade || !product) return;
    
    const fetchVariantDetails = async () => {
      // Only show loading after 200ms to avoid flicker for cached data
      const loadingTimer = setTimeout(() => {
        setLoadingVariant(true);
      }, 200);
      
      try {
        const selectedOptions = [{
          name: 'Color',
          value: selectedShade.name
        }];
        
        const result = await fetchVariantBySelectedOptions(
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
  }, [selectedShade, product]);

  const handleAddToCart = () => {
    if (selectedVariantId && onAddToCart) {
      onAddToCart(selectedVariantId);
      // Don't hide the modal or reset the selection
    }
  };

  // Render a shade item
  const renderShadeItem = ({ item }) => (
    <Pressable 
      style={styles.shadeItem}
      onPress={() => setSelectedShade(item)}
    >
      <View style={styles.shadeContainer}>
        {item.colorHex ? (
          <View style={[
            styles.shadeTablet, 
            { backgroundColor: item.colorHex }
          ]} />
        ) : item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.shadeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.shadeTablet, 
            { backgroundColor: '#CCCCCC' }
          ]} />
        )}
        
        {/* Checkmark overlay for selected shade */}
        {selectedShade?.id === item.id && (
          <View style={styles.checkmarkContainer}>
            <Icon 
              name="check" 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
        )}
      </View>
      <Text style={[
        styles.shadeName,
        (selectedShade?.id === item.id) ? styles.selectedShadeName : {}
      ]}>{item.name}</Text>
    </Pressable>
  );

  return (
    <BottomSheet 
      ref={bottomSheetRef}
      title={"Select Shade"}
      sheetHeightFraction={0.8} // 80% of screen height
    >
      {product && (
        <View style={styles.bottomSheetContent}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            {loadingVariant ? (
              <View style={[
                styles.loadingContainer,
                {minHeight: screenWidth / 2.1}
              ]}>
                <ActivityIndicator size="small" color="#00909E" />
              </View>
            ) : (
              <>
                <Image 
                  source={{ uri: selectedVariant?.image?.url || product.featuredImage?.url }} 
                  style={[
                    styles.productImage,
                    {
                      height: screenWidth / 2.1
                    }
                  ]}
                  resizeMode="contain"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₹{parseInt(selectedVariant?.price?.amount).toLocaleString()}
                  </Text>
                  {selectedVariant?.weight > 0 && (
                    <Text style={styles.productWeight}>
                      {selectedVariant.weight} {selectedVariant.weightUnit.toLowerCase()}
                    </Text>
                  )}
                  <Text style={styles.productWeight}>
                    Shade: {selectedVariant?.title}
                  </Text>
                </View>
              </>
            )}
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Shade Selection */}
          <FlatList
            data={shades}
            renderItem={renderShadeItem}
            keyExtractor={item => item.id}
            numColumns={4}
            contentContainerStyle={styles.shadeGrid}
            showsVerticalScrollIndicator={true}
            style={styles.flatListContainer}
          />
          
          {/* Add to Cart Button */}
          <Pressable 
            style={[
              styles.addToCartButton,
              !selectedShade && styles.addToCartButtonDisabled
            ]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>
              {selectedShade ? "Add to Cart" : "Select a Shade"}
            </Text>
          </Pressable>
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
  flatListContainer: {
    flex: 1,
  },
  shadeGrid: {
    paddingBottom: 16,
  },
  shadeItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8
  },
  shadeContainer: {
    position: 'relative',
    width: '100%',
    height: 56,
    marginBottom: 8,
  },
  shadeTablet: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  shadeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
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
  selectedShadeName: {
    color: '#00AEBD',
    fontWeight: '600'
  }
});

export default ShadeSelector;
