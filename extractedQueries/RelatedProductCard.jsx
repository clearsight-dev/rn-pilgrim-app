import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import PilgrimCartButton from './PilgrimCartButton';
import { Image } from './ImageComponent';
import { navigateToScreen } from 'apptile-core';
import { useDispatch } from 'react-redux';
import Star from './Star';
import ProductFlag from './ProductFlag';
import { addLineItemToCart } from './selectors';
import { colors, FONT_FAMILY, typography } from './theme';

export function isValidColor(color) {
  if (typeof color !== 'string') return false;

  const namedColors = new Set([
    'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'gray',
    'grey', 'orange', 'purple', 'brown', 'pink', 'lime', 'teal', 'navy', 'gold', 'silver', 'maroon',
    // Add more named colors if needed
  ]);

  const hexRegex = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const rgbRegex = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
  const rgbaRegex = /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  const hslRegex = /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/;
  const hslaRegex = /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

  return (
    namedColors.has(color.toLowerCase()) ||
    hexRegex.test(color) ||
    rgbRegex.test(color) ||
    rgbaRegex.test(color) ||
    hslRegex.test(color) ||
    hslaRegex.test(color)
  );
}


function RelatedProductCard({
  product,
  style,
  cardVariant,
  onSelectShade,
  onSelectVariant,
  headingStyles = {},
  isHighlighted = false
}) {
  const {
    handle,
    title,
    featuredImage,
    price,
    compareAtPrice,
    rating,
    productType,
    variantsCount,
    productLabel1,
    productLabel2,
    weight,
    weightUnit,
    textBenefits,
    productSize,
    productShortTitle
  } = product;

  const productLabel2Text = productLabel2?.value?.split("|")[0]?.trim();
  const productLabel2Color = productLabel2?.value?.split("|")[1]?.trim();

  // Calculate discount percentage if compareAtPrice exists
  let discountPercentage = compareAtPrice?.amount
    ? Math.round(
      ((compareAtPrice.amount - price.amount) / compareAtPrice.amount) * 100,
    )
    : 0;
  if (isNaN(discountPercentage)) {
    discountPercentage = 0;
  }

  let weightString = '';
  if (weight && weightUnit && weightUnit.toString) {
    weightString = `${weight}${weightUnit.toString().toLowerCase()}`;
  }

  const dispatch = useDispatch();

  // Find the first non-color option for variant selection
  let variantOptionName = 'Shade';
  if (product.options && product.options.length > 0) {
    const nonColorOption = product.options.find(
      option => option.name.toLowerCase() !== 'color',
    );
    if (nonColorOption) {
      variantOptionName = nonColorOption.name;
    }
  }

  // Determine the CTA button text and action
  const isSelectShade = variantsCount > 1 && productType.startsWith('Makeup');
  const isChooseVariant =
    variantsCount > 1 && !productType.startsWith('Makeup');
  const buttonText = isSelectShade
    ? 'Select Shade'
    : isChooseVariant
      ? 'Choose Variant'
      : 'Add to Cart';

  const variantText = isSelectShade
    ? `${variantsCount} Shades`
    : isChooseVariant
      ? `${variantsCount} Size`
      : '' || productSize;

  const benefitText = textBenefits?.items[0]

  const handleButtonPress = e => {
    if (isSelectShade && onSelectShade) {
      return onSelectShade(product);
    } else if (isChooseVariant && onSelectVariant) {
      return onSelectVariant(product);
    } else {
      return addLineItemToCart(product.firstVariantId);
    }
  };


  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.4 },
        style,
      ]}
      onPress={() => {
        dispatch(navigateToScreen('Product', { productHandle: handle }));
      }}>
      {/* Promo Tag */}
      {productLabel2Text && (
        <ProductFlag
          label={productLabel2Text}
          color={isValidColor(productLabel2Color) ? productLabel2Color : colors.secondaryMain}
          style={styles.promoTagContainer}
          height={20}
          width={80}
        />
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: featuredImage?.url }}
          style={styles.image}
          resizeMode="contain"
        />
        {rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={[typography.subHeading14, styles.ratingText]}>
              {rating}
            </Text>
            <Star color={colors.secondaryMain} size={12} fillPercentage={1} />
          </View>
        )}
      </View>

      {/* Product Details */}
      <View
        style={[
          styles.detailsContainer,
          cardVariant === 'large' ? { alignItems: 'center' } : {},
        ]}>
        {productLabel1?.value ? (
          <Text style={[typography.heading14, typography.bestseller]}>
            {productLabel1?.value?.toUpperCase()}
          </Text>
        ) : (
          <View style={{ height: 11 }}></View>
        )}
        <Text
          style={[typography.heading14, { marginBottom: 2 }, headingStyles, { fontFamily: FONT_FAMILY.bold }]}
          numberOfLines={2}>
          {productShortTitle || title}
        </Text>
        {benefitText && (
          <Text style={[styles.subtitle, typography.subHeading12, { color: "#767676" }]}>
            {benefitText}
          </Text>
        )}

        {variantText && (
          <Text style={[styles.subtitle, typography.subHeading12, { color: "#767676" }]}>
            {variantText}
          </Text>
        )}

        {/* Price Section */}
        <View
          style={{
            flexGrow: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
          <View style={[styles.priceContainer]}>
            <Text style={[typography.price, styles.price, isHighlighted ? { textAlign: 'center' } : {}]}>
              ₹{parseInt(price.amount)}
            </Text>
          </View>
          {compareAtPrice?.amount && discountPercentage > 0 && (
            <View style={[styles.priceContainer, isHighlighted ? { justifyContent: 'center' } : {}]}>
              <Text style={[typography.slashedPrice, styles.compareAtPrice, { fontSize: 11 }]}>
                ₹{parseInt(compareAtPrice?.amount)}
              </Text>
              <Text style={[typography.savings, { fontSize: 11 }]}>
                {discountPercentage}% Off
              </Text>
            </View>)}
        </View>
      </View>
      <PilgrimCartButton buttonText={buttonText} onPress={handleButtonPress} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 184,
    backgroundColor: colors.white,
    overflow: 'hidden',
    marginRight: 12,
  },
  promoTagContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    zIndex: 1,
  },
  promoTagText: {
    fontFamily: FONT_FAMILY.bold,
    color: colors.white,
    fontSize: 10,
  },
  imageContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark10,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 24,
    borderColor: colors.dark10,
    backgroundColor: 'white',
  },
  ratingText: {
    fontSize: 11,
    color: colors.dark70,
    marginRight: 4,
  },
  detailsContainer: {
    flexGrow: 1,
    fontSize: 12,
    color: colors.dark60,
    fontFamily: FONT_FAMILY.regular,
    padding: 12,
    paddingTop: 4,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    color: colors.dark60,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  price: {
    marginRight: 4,
    minWidth: 100,
    width: '100%',
    marginBottom: 4,
  },
  compareAtPrice: {
    marginRight: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default memo(RelatedProductCard);
