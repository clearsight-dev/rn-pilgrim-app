import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const UserPhotos = ({ photos = [], onSeeAllPress }) => {

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
        contentContainerStyle={styles.photosContainer}
      >
        {photos.map((photo) => (
          <View key={photo.id} style={styles.photoWrapper}>
            <Image 
              source={{ uri: photo.url }} 
              style={styles.photo} 
              resizeMode="cover"
            />
          </View>
        ))}
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
    paddingHorizontal: 16,
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
  photosContainer: {
    paddingHorizontal: 12,
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
