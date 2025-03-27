import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {Image} from '../../../../extractedQueries/ImageComponent';
import { ImageSkeleton } from './SkeletonLoaders';

const UserPhotos = ({ photos = [], onSeeAllPress, isLoading = false }) => {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Photos</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllButton}>See all</Text>
        </TouchableOpacity>
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
                resizeMode="cover"
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
    fontWeight: '600',
    color: '#000',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  photoWrapper: {
    width: 100,
    height: 100,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default UserPhotos;
