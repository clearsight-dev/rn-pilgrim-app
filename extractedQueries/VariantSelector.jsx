import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  FlatList,
  Image,
} from 'react-native';
import { useApptileWindowDims } from 'apptile-core';
import BottomSheet from './BottomSheet';
import { fetchProductOptions, fetchVariantBySelectedOptions } from './collectionqueries';
import VariantCard from './VariantCard';
import {addLineItemToCart} from './selectors';
import PilgrimCartButton from './PilgrimCartButton';
import { colors, typography } from './theme';

function VariantSelector({ 
  bottomSheetRef, 
  product, 
  onClose
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const originalBottomSheetRef = useRef(bottomSheetRef);
  const {width: screenWidth} = useApptileWindowDims();

  // TODO(gaurav): This is probably doing nothing. Remove and see if it makes any
  // difference
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

  // Process product options to get variant data
  useEffect(() => {
    if (!product) return;

    async function getVariants() {
      const res = await fetchProductOptions(product.handle, product.variantsCount);
      const options = res?.options ?? [];
      const variants = res?.variants ?? [];

      // Find the specified option 
      const option = options?.[0];
      
      if (!option) return;

      let processedVariants = [];
      for (let index = 0; index < option.optionValues.length; ++index) {
        const value = option.optionValues[index];
        const variant = variants.find(it => {
          return it?.node?.selectedOptions?.[0]?.value === value.name;
        });

        if (variant) {
          processedVariants.push(variant.node);
        }
      }
      
      setVariants(processedVariants);
      setSelectedVariant(processedVariants[0]);
    }

    getVariants();
    return () => {
      setSelectedVariant(null);
    }
  }, [product]);

  const handleAddToCart = () => {
    return new Promise((resolve, reject) => {
      if (selectedVariant) {
        resolve(addLineItemToCart(selectedVariant.id));
      } else {
        reject(new Error("Cannot add to cart because there is no selected variant"));
      }
    });
  };

  // Render a variant item
  const renderVariantItem = ({ item, index }) => (
    <Pressable 
      style={styles.variantItem}
      onPress={() => setSelectedVariant(item)}
    >
      <VariantCard
        variant={item}
        isSelected={selectedVariant?.id === item.id}
        isPopular={index === 0} // First item is always popular choice
      />
    </Pressable>
  );

  return (
    <BottomSheet 
      ref={bottomSheetRef}
      title={`Select variant`}
      sheetHeightFraction={0.8} // 80% of screen height
      onClose={() => {
        setSelectedVariant(null);
        onClose();
      }}
    >
      {product && (
        <View style={styles.bottomSheetContent}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            {(!!selectedVariant?.image?.url) ? (<Image 
              source={{ uri: selectedVariant?.image?.url || "" }} 
              style={[
                styles.productImage,
                {
                  height: screenWidth / 2.1
                }
              ]}
              resizeMode="contain"
            />):(
              <View
                style={[styles.productImage, {height: screenWidth / 2.1, aspectRatio: 1}]}
              />
            )}
            <View style={styles.productInfo}>
              <Text style={[typography.family, styles.productTitle]} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={[typography.family, styles.productPrice]}>
                ₹{parseInt(selectedVariant?.price?.amount || "0").toLocaleString()}
              </Text>
              {selectedVariant?.weight > 0 && (
                <Text style={[typography.family, styles.productWeight]}>
                  {selectedVariant.weight} {selectedVariant.weightUnit.toLowerCase()}
                </Text>
              )}
              <Text style={[typography.family, styles.productWeight]}>
                Variant: {selectedVariant?.title || selectedVariant?.name}
              </Text>
            </View>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Variant Selection */}
          <FlatList
            data={variants}
            renderItem={renderVariantItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.variantGrid}
            showsVerticalScrollIndicator={true}
            style={styles.flatListContainer}
          />
          
          {/* Add to Cart Button */}
          <PilgrimCartButton 
            buttonText={selectedVariant ? "Add to Cart" : "Choose a variant"}
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
    borderColor: colors.dark10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark10,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.dark10,
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 14,
    color: colors.dark60,
  },
  loadingContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: colors.dark10,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark50,
    marginVertical: 16,
  },
  flatListContainer: {
    flex: 1,
  },
  variantGrid: {
    paddingBottom: 16,
  },
  variantItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default VariantSelector;
