import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "../../../../extractedQueries/ImageComponent";
import { Icon } from "apptile-core";
import RatingPill from "../../../../extractedQueries/RatingPill";
import OfferCard from "./OfferCard";
import VariantCard from "../../../../extractedQueries/VariantCard";
import { normalizeOption } from "../../../../extractedQueries/ShadeSelector";
import _ from "lodash-es";

import {
  colors,
  FONT_FAMILY,
  typography,
} from "../../../../extractedQueries/theme";

// Enhanced variant selector component using the new VariantCard
export function InlineVariantSelector({
  variants,
  selectedVariant,
  setSelectedVariant,
}) {
  const optionName = variants?.[0]?.selectedOptions?.[0]?.name ?? "Size";
  let renderedVariantOptions;
  if (optionName.toLowerCase() === "color") {
    renderedVariantOptions = variants.map((variant, index) => {
      const { colorHex, imageUrl } = normalizeOption(variant.title);
      const isSelected = selectedVariant?.id === variant.id;
      return (
        <Pressable
          key={`variant-${index}`}
          onPress={() => setSelectedVariant(variant)}
          activeOpacity={0.7}
        >
          {colorHex ? (
            <View style={[styles.shadeTablet, { backgroundColor: colorHex }]} />
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.shadeImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[styles.shadeTablet, { backgroundColor: "#CCCCCC" }]}
            />
          )}
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Icon name="check" size={24} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
      );
    });
  } else {
    // optionName is Size or Variant
    renderedVariantOptions = variants.map((variant, index) => {
      return (
        <Pressable
          key={`variant-${index}`}
          onPress={() => setSelectedVariant(variant)}
          activeOpacity={0.7}
        >
          <VariantCard
            variant={variant}
            optionName={optionName}
            isSelected={selectedVariant?.id === variant.id}
            isPopular={index == 0}
          />
        </Pressable>
      );
    });
  }

  return (
    <View style={styles.variantSelectorContainer}>
      {selectedVariant?.title && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={[styles.variantTitle, { fontFamily: FONT_FAMILY.regular }]}
          >
            {optionName}:{" "}
          </Text>
          <Text style={styles.variantTitle}>{selectedVariant.title}</Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.variantOptionsContainer}
      >
        {renderedVariantOptions}
      </ScrollView>
    </View>
  );
}

function ProductInfo({
  product,
  offers,
  variants,
  selectedVariant,
  setSelectedVariant,
  scrollToSection
}) {
  // Calculate discount percentage if compareAtPrice exists
  let discountPercentage = selectedVariant?.compareAtPrice?.amount
    ? Math.round(
        ((selectedVariant?.compareAtPrice.amount -
          selectedVariant?.price.amount) /
          selectedVariant?.compareAtPrice.amount) *
          100
      )
    : 0;
  if (isNaN(discountPercentage)) {
    discountPercentage = 0;
  }
  
  return (
    <View style={styles.productInfoContainer}>
      {/* Bestseller tag */}
      {product?.productLabel1?.value && (
        <View style={styles.bestsellerContainer}>
          <Text style={[styles.bestsellerText]}>
            {product?.productLabel1?.value?.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Product Title */}
      {product?.title && (
        <Text style={styles.productTitle}>{product?.title}</Text>
      )}

      {/* Product Subtitle */}
      {product?.subtitle?.value && (
        <Text style={styles.productSubtitle}>{product?.subtitle?.value}</Text>
      )}

      {/* Price - VERTICALLY ARRANGED */}
      {selectedVariant?.price?.amount && (
        <View style={styles.priceContainer}>
          <View style={[{ flexDirection: "row", alignItems: "baseline" }]}>
            <View style={[styles.priceRow, { marginRight: 4 }]}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.price}>
                {parseInt(selectedVariant?.price?.amount)}
              </Text>
            </View>

            {selectedVariant?.compareAtPrice?.amount &&
              discountPercentage > 0 && (
                <>
                  <Text
                    style={[
                      typography.slashedPrice,
                      styles.compareAtPrice,
                      { fontSize: 11, marginRight: 4 },
                    ]}
                  >
                    ₹{parseInt(selectedVariant?.compareAtPrice?.amount)}
                  </Text>
                  <Text style={[typography.savings, { fontSize: 11 }]}>
                    {discountPercentage}% Off
                  </Text>
                </>
              )}
          </View>
          <Text style={styles.taxInfo}>MRP inclusive of all taxes</Text>
        </View>
      )}

      {/* Pilgrim miles */}
      {selectedVariant?.price?.amount && (
        <View style={styles.milesContainer}>
          <Icon
            iconType={"Ionicons"}
            name={"sparkles-sharp"}
            style={{
              marginRight: 8,
              fontSize: 20,
              color: "#00726C",
            }}
          />
          <Text style={styles.milesText}>Earn up to </Text>
          <Text
            style={[
              styles.milesText,
              { fontFamily: FONT_FAMILY.bold, color: "#00726C" },
            ]}
          >
            ₹{Math.floor(parseInt(selectedVariant?.price?.amount) * 0.05)}{" "}
            PilgrimMILES
          </Text>
          <Text style={styles.milesText}> on this product</Text>
        </View>
      )}

      {/* Rating - Using parsed JSON value */}
      {!_.isEmpty(product?.rating) && (
        <Pressable onPress={() => scrollToSection("ratings")}>
        <View style={styles.ratingContainer}>
          <RatingPill
            rating={product?.rating}
            size={16}
            backgroundColor={colors.primaryDark}
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
              {product?.reviews?.value}
            </Text>
            <Icon
              iconType={"Material Icon"}
              name={"check-decagram"}
              style={{
                marginRight: 2,
                fontSize: 20,
                color: "#00AEEF",
              }}
            />
            <Text style={styles.verifiedText}>Verified reviews</Text>
          </View>}
        </View>
        </Pressable>
      )}

      {/* Variant Selector */}
      {product?.variantsCount > 1 && (
        <InlineVariantSelector
          variants={variants}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />
      )}

      {/* Active Offers Section - Using the new offer card design */}
      {offers.length > 0 && (
        <View style={styles.offersSection}>
          <Text style={styles.offersSectionTitle}>Active Offers</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.offersScrollView}
            contentContainerStyle={styles.offersScrollContent}
          >
            {offers.map((offer, index) => (
              <OfferCard
                key={`offer-${index}`}
                title={offer.title}
                description={offer.description}
                code={offer.code}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  productInfoContainer: {
    padding: 16,
  },
  bestsellerContainer: {
    marginBottom: 8,
  },
  bestsellerText: {
    color: colors.accentCoral,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
  },
  productTitle: {
    fontSize: 19,
    fontFamily: FONT_FAMILY.bold,
    letterSpacing: -0.2,
    color: "#2A2A2A",
  },
  productSubtitle: {
    fontSize: 16,
    color: "#767676",
    fontFamily: FONT_FAMILY.regular,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceSymbol: {
    fontSize: 20,
    color: "#1A1A1A",
    fontFamily: FONT_FAMILY.bold,
  },
  price: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    color: "#1A1A1A",
  },
  taxInfo: {
    color: "#8C8C8C",
    fontFamily: FONT_FAMILY.regular,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24
  },
  reviewCount: {
    flexDirection: "row",
    marginLeft: 8,
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: "#1A1A1A",
    textDecorationLine: "underline",
  },
  isSelectedBox: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
    padding: 2,
  },

  // Variant selector styles
  variantSelectorContainer: {
    marginBottom: 16,
  },
  variantTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: "#333",
  },
  variantOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  // Offers section styles
  offersSection: {},
  offersSectionTitle: {
    fontSize: 19,
    fontFamily: FONT_FAMILY.bold,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  offersScrollView: {
    marginBottom: 16,
  },
  offersScrollContent: {
    paddingRight: 16,
  },
  shadeTablet: {
    marginHorizontal: 6,
    width: 44,
    aspectRatio: 1,
    borderRadius: 4,
  },
  shadeImage: {
    marginHorizontal: 6,
    width: 44,
    aspectRatio: 1,
    borderRadius: 4,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
  },
  milesContainer: {
    backgroundColor: "#E6F7F9",
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  milesText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
    color: "#313131",
  },
});

export default ProductInfo;
