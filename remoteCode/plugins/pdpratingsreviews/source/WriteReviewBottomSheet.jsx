import React, { forwardRef, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from '../../../../extractedQueries/BottomSheet';
import Star from '../../../../extractedQueries/Star';

const WriteReviewBottomSheet = forwardRef(function (props, ref) {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const titleInputRef = useRef(null);
  const reviewInputRef = useRef(null);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
    validateForm(selectedRating, titleInputRef.current?.value, reviewInputRef.current?.value);
  };

  const validateForm = (currentRating, titleText, reviewText) => {
    const ratingValid = currentRating > 0;
    const titleValid = titleText && titleText.trim().length > 0;
    const reviewValid = reviewText && reviewText.trim().length > 0;
    
    setIsFormValid(ratingValid && titleValid && reviewValid);
  };

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

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    const titleText = titleInputRef.current?.value || '';
    const reviewText = reviewInputRef.current?.value || '';
    
    setIsSubmitting(true);
    
    // Mock API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Reset form after submission
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
    }, 2000);
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

  return (
    <BottomSheet 
      ref={ref}
      title="Write a Review"
      sheetHeight={0.7}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Rating Section */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Rating</Text>
              {renderStars()}
            </View>
            
            {/* Title Section */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Title of review</Text>
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
              <Text style={styles.label}>How was your experience?</Text>
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
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    minHeight: 200,
  },
  formRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
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
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#00909E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WriteReviewBottomSheet;
