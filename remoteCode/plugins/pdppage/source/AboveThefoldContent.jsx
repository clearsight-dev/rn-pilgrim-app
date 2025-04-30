import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Carousel } from "../../../../extractedQueries/ImageCarousel";
import { Image } from "../../../../extractedQueries/ImageComponent";
import ProductFlag from "../../../../extractedQueries/ProductFlag";
import ProductInfo from "./ProductInfo";
import AboveThefoldSkeleton from "./AboveThefoldSkeleton";
import { colors, typography } from "../../../../extractedQueries/theme";
import { FONT_FAMILY } from "../../../../extractedQueries/theme";

function AboveThefoldContent({
  loading,
  error,
  product,
  variants,
  selectedVariant,
  setSelectedVariant,
  screenWidth,
}) {
  const carouselRef = useRef(null);
  let productImages;
  if (Array.isArray(product?.images)) {
    productImages = product.images.slice();
  } else {
    productImages = [];
  }

  for (let i = 0; i < variants.length; ++i) {
    productImages.push({ ...variants[i].image, variantId: variants[i].id });
  }

  const handleVariantSelect = useCallback(
    (variant) => {
      setSelectedVariant(variant);
      if (carouselRef.current) {
        const requiredImage = variant.image?.url;
        const index = productImages.findIndex(
          (productImg) => productImg.url === requiredImage
        );
        if (index >= 0) {
          carouselRef.current.scrollToIndex(index);
        } else {
          console.error("Could not find image: ", requiredImage, productImages);
        }
      }
    },
    [productImages, carouselRef]
  );

  if (loading) {
    return <AboveThefoldSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[typography.family, styles.errorText]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      {product?.productLabel2?.value && (
        <ProductFlag
          label={product?.productLabel2?.value}
          color={colors.secondaryMain}
          style={styles.promoTagContainer}
          height={24}
          width={104}
          fontSize={12}
        />
      )}
      <Carousel
        ref={carouselRef}
        flatlistData={productImages}
        scrollBubbleEnabled={true}
        renderChildren={({ item }) => {
          return (
            <Image
              source={{ uri: item.url }}
              resizeMode="contain"
              style={{
                width: screenWidth,
                aspectRatio: 1,
                minHeight: 100,
              }}
            />
          );
        }}
        width={screenWidth}
        aspectRatio={1}
      />
      {/* <Text>{JSON.stringify(productImages, null, 2)}</Text> */}
      <ProductInfo
        product={product}
        offers={product?.offers}
        variants={variants}
        selectedVariant={selectedVariant}
        setSelectedVariant={handleVariantSelect}
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
  promoTagText: {
    fontFamily: FONT_FAMILY.bold,
    color: colors.white,
    fontSize: 90,
  },
});

export default AboveThefoldContent;
