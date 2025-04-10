import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

// Animated skeleton component with shimmer effect
const SkeletonBase = ({ style, children }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: false,
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return (
    <View style={[styles.skeletonBase, style]}>
      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// Product count skeleton
export const ProductCountSkeleton = () => (
  <SkeletonBase style={styles.countSkeleton}>
    <View style={styles.countBar} />
  </SkeletonBase>
);

// Product card skeleton
export const ProductCardSkeleton = () => (
  <SkeletonBase style={styles.cardSkeleton}>
    <View style={styles.imageContainer}>
      <View style={styles.image} />
    </View>
    <View style={styles.titleBar} />
    <View style={styles.priceBar} />
    <View style={styles.ratingContainer}>
      <View style={styles.ratingBar} />
    </View>
  </SkeletonBase>
);

// Grid of product card skeletons
export const ProductGridSkeleton = ({ numColumns = 2, numItems = 4 }) => {
  const items = Array(numItems).fill(0);
  
  return (
    <View style={styles.gridContainer}>
      {items.map((_, index) => (
        <View key={`skeleton-${index}`} style={[styles.cardWrapper, { width: `${100 / numColumns}%` }]}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  countSkeleton: {
    height: 20,
    width: 100,
    borderRadius: 4,
  },
  countBar: {
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  cardSkeleton: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
    height: 250,
  },
  imageContainer: {
    height: '60%',
    marginBottom: 12,
  },
  image: {
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  titleBar: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  priceBar: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '30%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 80, // Add padding to account for bottom buttons
    widht: '100%'
  },
  cardWrapper: {
    paddingHorizontal: 4,
  },
});
