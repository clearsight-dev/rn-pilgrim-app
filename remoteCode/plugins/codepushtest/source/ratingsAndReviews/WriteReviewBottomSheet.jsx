import React, { forwardRef, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from '../../../../../extractedQueries/BottomSheet';
import Star from '../../../../../extractedQueries/Star';
import { useApptileWindowDims } from 'apptile-core';
import { colors, FONT_FAMILY, typography } from '../../../../../extractedQueries/theme';

const WriteReviewBottomSheet = forwardRef(function ({ onSubmitReview }, ref) {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const titleInputRef = useRef(null);
  const reviewInputRef = useRef(null);
  const {height: screenHeight} = useApptileWindowDims();

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
    validateForm(selectedRating, titleInputRef.current?.value, reviewInputRef.current?.value);
  };

  const validateForm = useCallback((currentRating, titleText, reviewText) => {
    const ratingValid = currentRating > 0;
    const titleValid = titleText && titleText.trim().length > 0;
    const reviewValid = reviewText && reviewText.trim().length > 0;
    
    const currentValidity = ratingValid && titleValid && reviewValid;
    if (isFormValid !== currentValidity) {
      setIsFormValid(currentValidity);
    }
    
  }, [isFormValid]);

  const handleTitleChange = (text) => {
    if (titleInputRef.current) {
      titleInputRef.current.value = text;
    }
    validateForm(rating, text, reviewInputRef.current?.value);
  };

  const handleReviewChange = (text) => {
    if (reviewInputRef.current) {
      reviewInputRef.current.value = text;
    }
    validateForm(rating, titleInputRef.current?.value, text);
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    const titleText = titleInputRef.current?.value || '';
    const reviewText = reviewInputRef.current?.value || '';
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Call the onSubmitReview function passed from parent
      await onSubmitReview(rating, titleText, reviewText);
      
      // Reset form after successful submission
      setRating(0);
      if (titleInputRef.current) {
        titleInputRef.current.clear();
        titleInputRef.current.value = '';
      }
      if (reviewInputRef.current) {
        reviewInputRef.current.clear();
        reviewInputRef.current.value = '';
      }
      setIsFormValid(false);
      
      // Close the bottom sheet on success
      if (ref && ref?.current && ref?.current?.hide) {
        ref.current?.hide();
      }
    } catch (error) {
      // Show error message
      if ((error?.message ?? "").startsWith('Cannot submit')) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Submission failed. Please try again.');
      }
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Star 
              fillPercentage={rating >= star ? 1 : 0} 
              size={30} 
              color={'#00909E'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const sheetBgHeight = screenHeight * 0.3;
  const tabHeaderHeight = 40; // from stackwithheader/source/index.jsx
  const bottomSheetHeaderHeightApprox = 40;

  return (
    <BottomSheet 
      ref={ref}
      title="Write a Review"
      sheetHeightFraction={0.7}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          keyboardVerticalOffset={sheetBgHeight + tabHeaderHeight + bottomSheetHeaderHeightApprox}
          behavior={'height'}
        >
          <ScrollView
            style={styles.content}
          >
            {/* Rating Section */}
            <View style={styles.formRow}>
              <Text style={[typography.family, styles.label]}>Rating</Text>
              {renderStars()}
            </View>
            
            {/* Title Section */}
            <View style={styles.formRow}>
              <Text style={[typography.family, styles.label]}>Title of review</Text>
              <TextInput
                ref={titleInputRef}
                style={styles.titleInput}
                placeholder="Enter a title for your review"
                onChangeText={handleTitleChange}
                maxLength={100}
              />
            </View>
            
            {/* Review Text Section */}
            <View style={styles.formRow}>
              <Text style={[typography.family, styles.label]}>How was your experience?</Text>
              <TextInput
                ref={reviewInputRef}
                style={styles.reviewInput}
                placeholder="Share your thoughts about the product..."
                onChangeText={handleReviewChange}
                multiline
                textAlignVertical="top"
                numberOfLines={5}
                maxLength={1000}
              />
            </View>
            
            {/* Error Message */}
            {errorMessage ? (
              <Text style={[typography.family, styles.errorMessage]}>{errorMessage}</Text>
            ) : null}
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                !isFormValid && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[typography.family, styles.submitButtonText]}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  formRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    color: colors.dark90,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: 8,
    padding: 5,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.dark20,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.dark20,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: colors.secondaryMain,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: colors.dark30,
  },
  submitButtonText: {
    color: colors.white,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    fontWeight: '600',
  },
  errorMessage: {
    color: colors.accentBurgundy,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default WriteReviewBottomSheet;
