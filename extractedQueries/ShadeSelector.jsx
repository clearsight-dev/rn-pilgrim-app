import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { useApptileWindowDims, Icon } from 'apptile-core';
import BottomSheet from './BottomSheet';
import { colorSwatches, imageSwatches } from './colorswatchinfo';
import { fetchProductOptions } from './collectionqueries';
import { addLineItemToCart } from './selectors';
import PilgrimCartButton from './PilgrimCartButton';
import { colors, FONT_FAMILY, gradients, typography } from './theme';
import { ProductPreviewCard } from './VariantSelector';
import { Image } from './ImageComponent'

export function normalizeOption(value) {
  const normalizedName = value?.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const colorHex = colorSwatches[normalizedName]?.colorHex;
  let imageUrl = null;
  if (!colorHex) {
    imageUrl = imageSwatches[normalizedName];
  }
  return { colorHex, imageUrl };
}

function ShadeSelector({
  bottomSheetRef,
  product,
  onClose
}) {
  const [shades, setShades] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { width: screenWidth } = useApptileWindowDims();

  // This has no loader, maybe add on. Haven't seen the need for one yet though
  // Process product options to get shade data
  useEffect(() => {
    if (!product) return;

    async function getShades() {
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
    const { colorHex, imageUrl } = normalizeOption(item.title)
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
              { backgroundColor: colors.dark20 }
            ]} />
          )}

          {/* Checkmark overlay for selected shade */}
          {selectedVariant?.id === item.id && (
            <View style={styles.checkmarkContainer}>
              <Icon
                name="check"
                size={24}
                color={colors.white}
              />
            </View>
          )}
        </View>
        <Text style={[
          typography.subHeading12,
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
        onClose();
      }}
    >
      {product && (
        <View style={styles.bottomSheetContent}>
          {/* Product Header */}
          <ProductPreviewCard product={product} selectedVariant={selectedVariant} />

          {/* Divider */}
          <View style={styles.divider} />

          <FlatList
            data={shades}
            renderItem={renderShadeItem}
            keyExtractor={item => {
              return item.id
            }}
            numColumns={3}

            contentContainerStyle={styles.shadeGrid}
            showsVerticalScrollIndicator={false}
            style={styles.flatListContainer}
          />

          {/* Add to Cart Button */}
          <PilgrimCartButton
            buttonText={selectedVariant ? "Add to Cart" : "Select a Shade"}
            onPress={handleAddToCart}
            disabled={!selectedVariant}
            isAvailable={selectedVariant?.availableForSale}
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
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark90,
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 18,
    fontWeight: '500',
    color: colors.dark90,
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 18,
    color: '#333',
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
    marginVertical: 16,
  },
  flatListContainer: {
    flex: 1,
  },
  shadeGrid: {
    paddingBottom: 16,
  },
  shadeItem: {
    width: '33%',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  shadeContainer: {
    position: 'relative',
    width: '100%',
    height: 56,
    marginBottom: 4,
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
    borderRadius: 4,
  },
  shadeName: {
    fontSize: 14,
    color: gradients.otherStroke.end,
    textAlign: 'center',
  },
  selectedShadeName: {
    color: colors.secondaryMain,
  }
});

export default ShadeSelector;
