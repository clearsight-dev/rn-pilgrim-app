import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import BottomSheet from '../../../../../extractedQueries/BottomSheet';
import ReviewCard from './ReviewCard';
import { colors, typography } from '../../../../../extractedQueries/theme';

const PhotosBottomSheet = forwardRef(function ({ reviews = [] }, ref) {
  const renderContent = () => {
    if (reviews.length > 0) {
      return (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ReviewCard review={item} />}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      );
    } else {
      return (
        <View style={styles.content}>
          <Text style={[typography.family, styles.placeholderText]}>
            No reviews available
          </Text>
        </View>
      );
    }
  };

  return (
    <BottomSheet 
      ref={ref}
      title="Customer Reviews"
      sheetHeightFraction={0.7}
    >
      {renderContent()}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  content: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.dark50,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default PhotosBottomSheet;
