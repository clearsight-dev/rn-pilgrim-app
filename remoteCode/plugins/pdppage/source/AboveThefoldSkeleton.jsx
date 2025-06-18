import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

const AboveThefoldSkeleton = () => {
  return (
    <View style={styles.scrollContainer}>
      {/* Skeleton loader for product carousel */}
      <View style={styles.skeletonCarousel}>
        <View style={styles.skeletonImageContainer}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonPagination}>
            {[...Array(4)].map((_, i) => (
              <View 
                key={`dot-${i}`} 
                style={[
                  styles.skeletonPaginationDot, 
                  i === 0 && styles.skeletonPaginationDotActive
                ]} 
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Skeleton for product info */}
      <View style={styles.productInfoContainer}>
        {/* Bestseller tag skeleton */}
        <View style={styles.skeletonBestseller} />
        
        {/* Product Title skeleton */}
        <View style={styles.skeletonTitle} />
        
        {/* Product Subtitle skeleton */}
        <View style={styles.skeletonSubtitle} />
        
        {/* Price skeleton */}
        <View style={styles.skeletonPrice} />
        <View style={styles.skeletonTaxInfo} />
        
        {/* Rating skeleton */}
        <View style={styles.ratingContainer}>
          <View style={styles.skeletonRatingBadge} />
          <View style={styles.skeletonReviewCount} />
        </View>
        
        {/* Variant Selector skeleton */}
        <View style={styles.skeletonVariantTitle} />
        <View style={styles.skeletonVariantsContainer}>
          {[...Array(3)].map((_, i) => (
            <View key={`variant-${i}`} style={styles.skeletonVariantCard} />
          ))}
        </View>
        
        {/* Offers Section skeleton */}
        <View style={styles.skeletonOfferTitle} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.offersScrollView}
          contentContainerStyle={styles.offersScrollContent}
        >
          {[...Array(3)].map((_, i) => (
            <View key={`offer-${i}`} style={styles.skeletonOfferCard} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1
  },
  // Skeleton styles
  skeletonCarousel: {
    height: 450,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  skeletonImageContainer: {
    height: 450,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  skeletonLabel: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 80,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  skeletonPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  skeletonPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 3,
  },
  skeletonPaginationDotActive: {
    backgroundColor: '#c0c0c0',
  },
  productInfoContainer: {
    padding: 16,
  },
  skeletonBestseller: {
    width: 80,
    height: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonTitle: {
    width: '80%',
    height: 28,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonSubtitle: {
    width: '90%',
    height: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    borderRadius: 4,
  },
  skeletonPrice: {
    width: 100,
    height: 32,
    backgroundColor: '#f0f0f0',
    marginBottom: 4,
    borderRadius: 4,
  },
  skeletonTaxInfo: {
    width: 180,
    height: 14,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    borderRadius: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonRatingBadge: {
    width: 50,
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonReviewCount: {
    width: 120,
    height: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  skeletonVariantTitle: {
    width: 200,
    height: 20,
    backgroundColor: '#f0f0f0',
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 4,
  },
  skeletonVariantsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  skeletonVariantCard: {
    width: 100,
    height: 120,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    borderRadius: 8,
  },
  skeletonOfferTitle: {
    width: 120,
    height: 24,
    backgroundColor: '#f0f0f0',
    marginBottom: 16
  },
  skeletonOfferCard: {
    width: 280,
    height: 100,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    borderRadius: 8,
  },
  offersScrollView: {
    marginBottom: 16,
  },
  offersScrollContent: {
    paddingRight: 16,
  },
});

export default AboveThefoldSkeleton;
