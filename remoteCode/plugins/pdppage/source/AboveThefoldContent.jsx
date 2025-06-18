import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Carousel } from "../../../../extractedQueries/ImageCarousel";
import { Image } from "../../../../extractedQueries/ImageComponent";
import ProductFlag from "../../../../extractedQueries/ProductFlag";
import ProductInfo from "./ProductInfo";
import AboveThefoldSkeleton from "./AboveThefoldSkeleton";
import { colors, typography } from "../../../../extractedQueries/theme";
import { isValidColor } from "../../../../extractedQueries/RelatedProductCard";
import _ from 'lodash-es'

function AboveThefoldContent({
  loading,
  error,
  product,
  variants,
  selectedVariant,
  setSelectedVariant,
  screenWidth,
  scrollToSection
}) {
  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
  }, []);

  // Handle loading and error states early
  if (loading) return <AboveThefoldSkeleton />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[typography.family, styles.errorText]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  // Process images
  const productImages = Array.isArray(product?.images)
    ? [...product.images]
    : [];

  // Filter images based on selected variant if needed
  const imageFilteringTxt =
    selectedVariant?.image?.altText?.startsWith("#Color_") ||
    selectedVariant?.image?.altText?.startsWith("#Size_")
      ? selectedVariant.image.altText
      : null;

  const filteredImages = imageFilteringTxt
    ? productImages.filter((entry) => entry?.altText === imageFilteringTxt)
    : productImages;

  const productLabel2Text = product?.productLabel2?.value?.split("|")[0]?.trim();
  const productLabel2Color = product?.productLabel2?.value?.split("|")[1]?.trim();
  const productLabel2Width = _.clamp((productLabel2Text?.length || 10) * 8 , 80, 150);

  return (
    <View style={styles.scrollContainer}>
      {productLabel2Text && (
        <ProductFlag
          label={productLabel2Text}
          color={isValidColor(productLabel2Color) ? productLabel2Color : colors.secondaryMain}
          style={styles.promoTagContainer}
          height={24}
          width={productLabel2Width}
          fontSize={12}
        />
      )}

      <Carousel
        flatlistData={filteredImages}
        scrollBubbleEnabled={true}
        renderChildren={({ item }) => (
          <Image
            source={{ uri: item.url }}
            resizeMode="contain"
            style={{
              width: screenWidth,
              aspectRatio: 1,
              minHeight: 100,
            }}
          />
        )}
        width={screenWidth}
        aspectRatio={1}
      />

      <ProductInfo
        product={product}
        offers={product?.offers}
        variants={variants}
        selectedVariant={selectedVariant}
        setSelectedVariant={handleVariantSelect}
        scrollToSection={scrollToSection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colors.dark5,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: colors.accentBurgundy,
    fontSize: 16,
  },
  promoTagContainer: {
    position: "absolute",
    top: 8,
    left: 0,
    zIndex: 1,
  },
  // Removed unused promoTagText style
});

export default AboveThefoldContent;
