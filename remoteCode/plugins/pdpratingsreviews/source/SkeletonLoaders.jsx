import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ImageSkeleton = () => {
  return (
    <View style={styles.imageSkeleton} />
  );
};

export const ReviewCardSkeleton = () => {
  return (
    <View style={styles.reviewCardContainer}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.pillSkeleton} />
        <View style={styles.dateSkeleton} />
      </View>
      <View style={styles.titleSkeleton} />
      <View style={styles.bodySkeleton} />
      <View style={[styles.bodySkeleton, {width: '70%'}]} />
      <View style={styles.nameSkeleton} />
    </View>
  );
};

const styles = StyleSheet.create({
  imageSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  reviewCardContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pillSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 9,
  },
  dateSkeleton: {
    width: 80,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  titleSkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
    borderRadius: 2,
  },
  bodySkeleton: {
    width: '100%',
    height: 14,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
    borderRadius: 2,
  },
  nameSkeleton: {
    width: 100,
    height: 14,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
    borderRadius: 2,
  },
});
