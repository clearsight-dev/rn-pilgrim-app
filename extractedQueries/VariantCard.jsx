import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import GradientText from './GradientText';
import { colors, FONT_FAMILY } from './theme';

function DiscountBadge({ discount }) {
  // Badge dimensions
  const width = 40;
  const height = 40;
  const peakHeight = 4; // Height of the peaks as requested
  const numPeaks = 3;
  const halfPeakWidth = width / (2 * numPeaks);
  
  // Create a path with three peaks (inverted mountains) at the bottom
  const createJaggedPath = () => {
    // Calculate positions for three peaks
    
    let path = `M0 ${height}`; // Start at bottom left with first peak
    path += ` L${halfPeakWidth} ${height - peakHeight}`; // Down to valley after first peak
    path += ` L${2 * halfPeakWidth} ${height}`; // Second peak
    path += ` L${3 * halfPeakWidth} ${height - peakHeight}`;
    path += ` L${4 * halfPeakWidth} ${height}`;
    path += ` L${5 * halfPeakWidth} ${height - peakHeight}`;
    path += ` L${6 * halfPeakWidth} ${height}`;
    path += ` L${width} 0`; // To top right
    path += ` L0 0`; // To top left
    path += ` Z`; // Close the path
    
    return path;
  };

  return (
    <View style={[styles.discountBadgeContainer, {height}]}>
      <Svg style={{position: 'absolute'}} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={createJaggedPath()}
          fill={colors.accentBurgundy}
        />
      </Svg>
      <Text
        style={styles.discountBadgeText}
      >
        {discount}
      </Text>
      <Text
        style={styles.discountBadgeText}
      >
        Off
      </Text>
    </View>
  );
};

const PopularChoiceFooter = () => (
  <View style={styles.popularChoiceFooter}>
    <Svg width={148} height={28} style={styles.footerGradient} viewBox="0 0 153 28">
      <Defs>
        <LinearGradient id="popularGradient" x1="100%" y1="50%" x2="0" y2="50%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
          <Stop offset="100%" stopColor="rgba(0, 174, 189, 0.01)" stopOpacity={0.08} />
        </LinearGradient>
      </Defs>
      <Rect
        x={-10}
        y={-10}
        width={153 + 10}
        height={28 + 10}
        fill="url(#popularGradient)"
      />
    </Svg>
    <View style={styles.gradientTextContainer}>
      <GradientText 
        text="Popular Choice" 
        fontSize={12}
        fontWeight="600"
        width="100%"
        height={20}
        gradientColors={[
          { offset: "0%", color: "#009FAD" },
          { offset: "50%", color: "#00707A" },
          { offset: "100%", color: "#009FAD" }
        ]}
      />
    </View>
  </View>
);

function VariantCard({ 
  variant,
  isSelected = false,
  isPopular = false,
}) {
  if (!variant) {
    return <Text>"no variant!"</Text>;
  }
  let truncatedVariantName = variant.title ?? "";
  if ((variant.title || "").indexOf("(") >= 0) {
    truncatedVariantName = variant.title.slice(0, variant.title.indexOf("("));
  }
  let discount = (1 - (parseFloat(variant?.compareAtPrice?.amount)/parseFloat(variant?.price?.amount)))*100;
  if (discount > 0) {
    discount = `${discount}%`;
  }

  return (
    <View style={styles.variantCardContainer}>   
      {/* Main Card Content */}
      <View style={[
        styles.variantCardContent,
        isSelected ? styles.variantCardSelected : styles.variantCardDefault
      ]}>
        {/* Discount Badge - Only shown if discount is provided */}
        {(discount > 0) && <DiscountBadge discount={discount} />}
        
        {/* Size and Price Information */}
        <View style={styles.variantInfoContainer}>
          <View style={styles.sizeContainer}>
            <Text style={styles.sizeLabel}>{variant.selectedOptions?.[0]?.name ?? "Size"}:</Text>
            <Text style={styles.sizeValue}>{truncatedVariantName}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{variant.price?.amount}</Text>
            {(variant.compareAtPrice?.amount !== variant.price?.amount) && (
              <Text style={styles.originalPrice}>₹{variant.compareAtPrice?.amount}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Popular Choice Footer - Only shown if isPopular is true */}
      {isPopular && <PopularChoiceFooter/>}
    </View>
  );
};

const styles = StyleSheet.create({
  footerGradient: {
    left: 0,
    top: 0,
    position: 'absolute',
    borderRadius: 8
  },
  variantCardContainer: {
    position: 'relative',
    margin: 5,
    marginTop: 28, // Space for the popular choice header
    width: 153,
  },
  popularChoiceFooter: {
    position: 'relative',
    padding: 5,
    zIndex: 1,
    bottom: 5,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: colors.primaryMain,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularChoiceText: {
    color: colors.primaryMain,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    fontWeight: '600',
  },
  gradientTextContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  variantCardContent: {
    zIndex: 2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    height: 67,
    justifyContent: 'center',
  },
  variantCardSelected: {
    borderColor: colors.primaryMain,
    borderWidth: 1.5,
  },
  variantCardDefault: {
    borderColor: colors.dark20,
  },
  discountBadgeContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: 0,
    right: 0,
    width: 40,
    paddingTop: 2,
    paddingHorizontal: 4,
    zIndex: 3,
    borderTopRightRadius: 8, 
    overflow: 'hidden',
  },
  discountBadgeText: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "600",
    fontSize: 12,
    color: 'white'
  },
  variantInfoContainer: {
    gap: 4,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sizeLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    color: colors.dark100,
  },
  sizeValue: {
    fontSize: 14,
    color: colors.dark100,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  currentPrice: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    color: colors.dark100,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.dark40,
    textDecorationLine: 'line-through',
  },
});

export default VariantCard;
