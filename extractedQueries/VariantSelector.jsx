import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { Image } from './ImageComponent'
import { useApptileWindowDims } from 'apptile-core';
import BottomSheet from './BottomSheet';
import { fetchProductOptions, fetchVariantBySelectedOptions } from './collectionqueries';
import VariantCard from './VariantCard';
import { addLineItemToCart } from './selectors';
import PilgrimCartButton from './PilgrimCartButton';
import { colors, FONT_FAMILY, typography } from './theme';
import StarRating from '../remoteCode/plugins/pdppage/source/ratingsAndReviews/StarRating';
import { InlineVariantSelector } from '../remoteCode/plugins/pdppage/source/ProductInfo';

function VariantSelector({
  bottomSheetRef,
  product,
  onClose
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const originalBottomSheetRef = useRef(bottomSheetRef);
  const { width: screenWidth } = useApptileWindowDims();

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
      sheetHeightFraction={0.6} // 60% of screen height
      onClose={() => {
        setSelectedVariant(null);
        onClose();
      }}
    >

      {product && (
        <View style={styles.bottomSheetContent}>
          {/* Product Header */}
          <ProductPreviewCard product={product} selectedVariant={selectedVariant} />

          {/* Divider */}
          <View style={styles.divider} />


          {/* Variant Selector */}
          {product?.variantsCount > 1 && (
            <InlineVariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
            />
          )}
        </View>
      )}

      {/* Add to Cart Button */}
      {product && <View style={{ padding: 16 }}>
        <PilgrimCartButton
          buttonText={selectedVariant ? "Add to Cart" : "Choose a variant"}
          onPress={handleAddToCart}
          isAvailable={selectedVariant?.availableForSale}
          disabled={!selectedVariant}
          variant='large'
        />
      </View>}
    </BottomSheet>
  );
};

export const ProductPreviewCard = ({ product, selectedVariant }) => {
  const benefitText = product?.textBenefits?.items[0]
  return (
    <View style={styles.productHeader}>
      {(!!selectedVariant?.image?.url) ? (<Image
        source={{ uri: selectedVariant?.image?.url || "" }}
        style={[
          styles.productImage,
          {
            aspectRatio: 1,
            width: '40%',
          }
        ]}
        resizeMode="contain"
      />) : (
        <View
          style={[styles.productImage, { width: '40%', aspectRatio: 1 }]}
        />
      )}
      <View style={styles.productInfo}>
        <Text style={[typography.family, styles.productTitle]} numberOfLines={2}>
          {product?.productShortTitle || product?.title}
        </Text>

        {benefitText && (
          <Text style={[typography.subHeading12, styles.subtitle, { color: "#767676" }]}>
            {benefitText}
          </Text>
        )}

        {!!product?.rating && (
            <View style={styles.ratingContainer}>
              <StarRating
                rating={product?.rating}
                size={16}
              />
              {product?.reviews?.value && <View style={styles.reviewCount}>
                <Text
                  style={{
                    marginRight: 5,
                    fontFamily: FONT_FAMILY.regular,
                    fontSize: 14,
                    color: "#1A1A1A",
                  }}
                >
                  ({product?.reviews?.value} Reviews)
                </Text>
              </View>}
            </View>
        )}

        <Text style={[typography.family, styles.productPrice]}>
          ₹{parseInt(selectedVariant?.price?.amount || "0")}
        </Text>

        {/* Shade Selection */}
        <View style={{ flexDirection: "row", alignItems: 'flex-end', marginTop: 8 }}>
          <Text style={[styles.productWeight, { marginRight: 5, lineHeight: 14 * 1.25 }]}>
            variant:
          </Text>
          <Text style={[styles.productWeight, { fontFamily: FONT_FAMILY.bold, lineHeight: 14 * 1.25 }]}>
            {selectedVariant?.title}
          </Text>
        </View>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  bottomSheetContent: {
    padding: 16,
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subtitle: {
    color: colors.dark60,
    marginBottom: 8,
    lineHeight: 14 * 1.25,
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: "#1A1A1A",
    textDecorationLine: "underline",
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
    fontFamily: FONT_FAMILY.bold,
    lineHeight: 16 * 1.25,
    // fontWeight: '600',
    color: colors.dark100,
    marginBottom: 8,
  },
  reviewCount: {
    flexDirection: "row",
    marginLeft: 8,
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.medium,
    // fontWeight: '500',
    color: colors.dark100,
    lineHeight: 18 * 1.25,
    // marginBottom: 4,
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
    backgroundColor: colors.dark10,
    marginVertical: 8,
  },
  flatListContainer: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default VariantSelector;
