import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import TimerComponent from './TimerComponent';
import GradientText from '../../../../extractedQueries/GradientText';

const DiscountBadge = ({ discount }) => (
  <View style={styles.discountBadgeContainer}>
    <View style={styles.discountBadge}>
      <Text style={styles.discountText}>{discount}Off</Text>
    </View>
  </View>
);


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

const VariantCard = ({ 
  size = "50ml", 
  price = "855", 
  originalPrice, 
  discount, 
  isPopular = false, 
  isSelected = false,
  showTimer = false,
  onSelect,
}) => {
  return (
    <View style={styles.variantCardContainer}>   
      {/* Main Card Content */}
      <View style={[
        styles.variantCardContent,
        isSelected ? styles.variantCardSelected : styles.variantCardDefault
      ]}>
        {/* Discount Badge - Only shown if discount is provided */}
        {discount && <DiscountBadge discount={discount} />}
        
        {/* Size and Price Information */}
        <View style={styles.variantInfoContainer}>
          <View style={styles.sizeContainer}>
            <Text style={styles.sizeLabel}>Size:</Text>
            <Text style={styles.sizeValue}>{size}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{price}</Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Popular Choice Foorter - Only shown if isPopular is true */}
      {isPopular && <PopularChoiceFooter/>}

      {/* Timer Component - Only shown if showTimer is true */}
      {showTimer && (
        <View style={styles.timerWrapper}>
          <TimerComponent />
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  footerGradient: {
    left: 0,
    top: 0,
    position: 'absolute',
    // borderWidth: 1,
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
    // backgroundColor: '#00AEBD1A', // Light teal with opacity
    borderWidth: 1,
    borderColor: '#00AEBD',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularChoiceText: {
    color: '#00AEBD',
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
    borderColor: '#00AEBD',
    borderWidth: 1.5,
  },
  variantCardDefault: {
    borderColor: '#D1D1D1',
  },
  discountBadgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  discountBadge: {
    backgroundColor: '#D64545',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sizeValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  originalPrice: {
    fontSize: 14,
    color: '#A3A3A3',
    textDecorationLine: 'line-through',
  },
  timerWrapper: {
    position: 'absolute',
    top: -12,
    left: 8,
    zIndex: 3,
  },
});

export default VariantCard;
