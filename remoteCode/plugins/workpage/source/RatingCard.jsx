import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from './StarRating';
import UserPhotos from './UserPhotos';
import WriteReviewBottomSheet from './WriteReviewBottomSheet';
import PhotosBottomSheet from './PhotosBottomSheet';

const RatingCard = ({ rating = 2, ratingCount = 0, photos = [] }) => {
  const reviewsBottomSheet = useRef(null);
  const photosBottomSheet = useRef(null);

  const handleWriteReviewPress = () => {
    if (reviewsBottomSheet.current) {
      reviewsBottomSheet.current.show();
    }
  };

  const handleSeeAllPhotosPress = () => {
    if (photosBottomSheet.current) {
      photosBottomSheet.current.show();
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>ratings & reviews</Text>
      
      {/* Rating Row */}
      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <View style={{flexDirection: "column", alignItems: "center", marginRight: 16}}>
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            <Text style={{fontSize: 14, fontWeight: 'bold', color: '#767676'}}>out of 5</Text>
          </View>
          <StarRating rating={rating} ratingCount={ratingCount} size={28} />
        </View>
        
      </View>
      
      {/* Write Review Button */}
      <TouchableOpacity 
        style={styles.writeReviewButton}
        onPress={handleWriteReviewPress}
      >
        <Text style={styles.writeReviewText}>Write a review</Text>
      </TouchableOpacity>
      
      {/* Customer Photos */}
      <UserPhotos 
        photos={photos} 
        onSeeAllPress={handleSeeAllPhotosPress} 
      />
      
      {/* Write Review Bottom Sheet */}
      <WriteReviewBottomSheet ref={reviewsBottomSheet} />
      
      {/* Photos Bottom Sheet */}
      <PhotosBottomSheet ref={photosBottomSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingHorizontal: 16,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 16,
    color: '#666666',
  },
  writeReviewButton: {
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A'
  },
  writeReviewText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RatingCard;
