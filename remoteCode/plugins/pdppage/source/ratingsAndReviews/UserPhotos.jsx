import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Image } from '../../../../../extractedQueries/ImageComponent';
import { ImageSkeleton } from './SkeletonLoaders';
import { colors, FONT_FAMILY } from '../../../../../extractedQueries/theme';

const UserPhotos = ({ photos = [], onSeeAllPress, isLoading = false }) => {
  if (!isLoading && photos?.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Photos</Text>
        {/* <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllButton}>See all</Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {isLoading ? (
          // Show skeleton loaders when loading
          Array.from({ length: 4 }).map((_, index) => (
            <View key={`skeleton-${index}`} style={styles.photoWrapper}>
              <ImageSkeleton />
            </View>
          ))
        ) : (
          // Show actual photos when loaded
          photos.map((photo) => (
            <View key={photo.id} style={styles.photoWrapper}>
              <Image
                source={{ uri: photo.url }}
                style={styles.photo}
                resizeMode="contain"
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: '#1A1A1A',
  },
  seeAllButton: {
    fontSize: 14,
    color: colors.dark70,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: '500',
  },
  photoWrapper: {
    width: 100,
    height: 100,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.dark10,
    overflow: 'hidden',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default UserPhotos;
