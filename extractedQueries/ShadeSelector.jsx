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
import { useApptileWindowDims, Icon } from 'apptile-core';
import BottomSheet from './BottomSheet';
import { colorSwatches, imageSwatches } from './colorswatchinfo';
import { fetchProductOptions, fetchVariantBySelectedOptions } from './collectionqueries';
import {addLineItemToCart} from './selectors';
import PilgrimCartButton from './PilgrimCartButton';

function ShadeSelector({ 
  bottomSheetRef, 
  product, 
  onClose
}) {
  const [selectedShade, setSelectedShade] = useState(null);
  const [shades, setShades] = useState([]);
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
      debugger
      const res = await fetchProductOptions(product.handle, product.variantsCount);
      const options = res?.options ?? [];
      const variants = res?.variants ?? [];

      // Find the color option
      const option = options?.find(option => 
        option.name.toLowerCase() === 'color' 
      );
      
      if (!option) return;
      // Process each color value
      const processedVariants = [];
      for (let index = 0; index < option.optionValues.length; ++index) {
        const value = option.optionValues[index];
        const variant = variants.find(it => {
          return it?.node?.selectedOptions?.[0]?.value === value.name;
        })

        if (variant) {
          processedVariants.push(variant.node);
        }
      }

      setShades(processedVariants);
      setSelectedVariant(processedVariants[0]);
    }

    getShades();
    return () => {
      setSelectedVariant(null);
    }
  }, [product]);

  function normalizeOption (value) {
    return value?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const handleAddToCart = () => {
    return new Promise((resolve, reject) => {
      if (selectedVariant) {
        resolve(addLineItemToCart(selectedVariant.id));
      } else {
        reject(new Error("Cannot add to cart because there is no selected variant"));
      }
    });
  };

  // Render a shade item
  const renderShadeItem = ({ item }) => {
    const normalizedName = normalizeOption(item.title)
    const colorHex = colorSwatches[normalizedName]?.colorHex;
    let imageUrl = null;
    if (!colorHex) {
      imageUrl = imageSwatches[normalizedName];
    }
    return (
      <Pressable 
        style={styles.shadeItem}
        onPress={() => setSelectedVariant(item)}
      >
        <View style={styles.shadeContainer}>
          {colorHex ? (
            <View style={[
              styles.shadeTablet, 
              { backgroundColor: colorHex }
            ]} />
          ) : imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
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
          {selectedVariant?.id === item.id && (
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
          (selectedVariant?.id === item.id) ? styles.selectedShadeName : {}
        ]}>{item.title}</Text>
      </Pressable>
    )
  };

  return (
    <BottomSheet 
      ref={bottomSheetRef}
      title={"Select Shade"}
      sheetHeightFraction={0.8} // 80% of screen height
      onClose={() => {
        setSelectedShade(null);
        onClose();
      }}
    >
      {product && (
        <View style={styles.bottomSheetContent}>
          {/* <Text>test insert: {JSON.stringify(selectedVariant, null, 2)}</Text> */}
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
                  source={{ uri: selectedVariant?.image?.url }} 
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
                  <Text style={styles.productWeight}>
                    {selectedVariant?.variantSubtitle?.value}
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
          <PilgrimCartButton 
            buttonText={selectedVariant ? "Add to Cart" : "Select a Shade"}
            onPress={handleAddToCart}
            disabled={!selectedVariant}
            variant='large'
          />
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
