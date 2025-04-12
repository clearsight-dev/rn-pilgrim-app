import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import {Icon} from 'apptile-core';
import StarRating from './StarRating';
import UserPhotos from './UserPhotos';
import WriteReviewBottomSheet from './WriteReviewBottomSheet';
import PhotosBottomSheet from './PhotosBottomSheet';
import ReviewCard from './ReviewCard';
import { ReviewCardSkeleton } from './SkeletonLoaders';
import { colors, typography } from '../../../../../extractedQueries/theme';

// Component for displaying consumer study results
function ConsumerStudyResults ({ results = [] }) {
  if (results.length === 0) return null;
  
  // Function to extract percentage and text from the result string
  const parseResult = (result) => {
    // Extract percentage using regex
    const percentageMatch = result.match(/^(\d+)%/);
    if (!percentageMatch) return { percentage: 0, text: result };
    
    const percentage = parseInt(percentageMatch[1], 10);
    // Remove percentage from the beginning and capitalize first letter
    const remainingText = result.replace(/^\d+%\s*/, '');
    const capitalizedText = remainingText.charAt(0).toUpperCase() + remainingText.slice(1);
    
    return { percentage, text: capitalizedText };
  };
  
  return (
    <View style={styles.consumerStudyContainer}>
      <Text style={[typography.family, styles.sectionTitle]}>Customer Insights</Text>
      
      {results.map((result, index) => {
        const { percentage, text } = parseResult(result);
        
        return (
          <View key={index} style={styles.insightRow}>
            <Text style={[typography.family, styles.insightText]}>{text}</Text>
            <View style={[typography.family, styles.progressBarContainer]}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${percentage}%` }
                ]} 
              />
            </View>
            <Text style={[typography.family, styles.percentageText]}>{percentage}%</Text>
          </View>
        );
      })}
    </View>
  );
};

function RatingCard ({ 
  rating = 2, 
  ratingCount = 0, 
  photos = [], 
  reviews = [], 
  isLoading = false,
  consumerStudyResults = [],
  onSubmitReview = async (rating, title, body) => {console.log("no submit review function provided");}
}) {
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
      <Text style={[typography.family, styles.sectionTitle]}>ratings & reviews</Text>
      
      {/* Rating Row */}
      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <View style={{flexDirection: "column", alignItems: "center", marginRight: 16}}>
            <Text style={[typography.family, styles.ratingValue]}>{rating.toFixed(1)}</Text>
            <Text style={[typography.family, {fontSize: 14, fontWeight: 'bold', color: colors.dark80}]}>out of 5</Text>
          </View>
          <StarRating rating={rating} ratingCount={ratingCount} size={28} />
        </View>
        
      </View>
      
      {/* Write Review Button */}
      <Pressable 
        style={({pressed}) => [
          styles.writeReviewButton, 
          pressed && {opacity: 0.5}
        ]}
        onPress={handleWriteReviewPress}
      >
        <Text style={[typography.family, styles.writeReviewText]}>Write a review</Text>
      </Pressable>
      
      {/* Consumer Study Results */}
      <ConsumerStudyResults results={consumerStudyResults} />
      
      {/* Customer Photos */}
      <UserPhotos 
        photos={photos} 
        onSeeAllPress={handleSeeAllPhotosPress}
        isLoading={isLoading}
      />
      
      {/* Recent Reviews */}
      {isLoading || reviews.length > 0 ? (
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={[typography.family, styles.sectionTitle]}>Customer Reviews</Text>
            
          </View>
          
          {/* Display skeleton loaders or review cards */}
          {isLoading ? (
            <>
              <ReviewCardSkeleton />
              <ReviewCardSkeleton />
            </>
          ) : (
            reviews.slice(0, 2).map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
              />
            ))
          )}

          <TouchableOpacity 
            onPress={handleSeeAllPhotosPress} 
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[typography.family, styles.seeAllButton]}>View all reviews</Text>
            <Icon 
              iconType={'Entypo'} 
              name={'chevron-right'} 
              style={styles.seeAllButton}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      
      {/* Write Review Bottom Sheet */}
      <WriteReviewBottomSheet ref={reviewsBottomSheet} onSubmitReview={onSubmitReview} />
      
      {/* Photos Bottom Sheet */}
      <PhotosBottomSheet ref={photosBottomSheet} reviews={reviews} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  consumerStudyContainer: {
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightText: {
    flex: 2,
    fontSize: 15,
    color: colors.dark100,
  },
  progressBarContainer: {
    flex: 2,
    height: 6,
    backgroundColor: colors.dark10,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.secondaryMain,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.dark100,
    width: 40,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark100,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: colors.dark100,
  },
  reviewCount: {
    fontSize: 16,
    color: colors.dark50,
  },
  writeReviewButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark100
  },
  writeReviewText: {
    color: colors.dark100,
    fontSize: 16,
    fontWeight: '500',
  },
  reviewsSection: {
    marginTop: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    fontSize: 15,
    color: colors.secondaryMain,
    fontWeight: '500',
  },
});

export default RatingCard;
