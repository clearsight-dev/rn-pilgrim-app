import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { Image } from '../../../../../extractedQueries/ImageComponent';
import { ImageSkeleton } from './SkeletonLoaders';
import { colors, FONT_FAMILY } from '../../../../../extractedQueries/theme';
import { Portal } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const UserPhotos = ({ photos = [], onSeeAllPress, isLoading = false }) => {
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setSelectedImage(null);
    setIsFullScreen(false);
  };

  // Handle back button press when in full screen mode
  React.useEffect(() => {
    if (isFullScreen) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleCloseFullScreen();
          return true;
        }
      );

      return () => backHandler.remove();
    }
  }, [isFullScreen]);

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
            <TouchableOpacity
              key={photo.id}
              onPress={() => handleImagePress(photo.url)}
              activeOpacity={0.8}
            >
              <View style={styles.photoWrapper}>
                <Image
                  source={{ uri: photo.url }}
                  style={styles.photo}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Portal>
        {isFullScreen && selectedImage && (
          <GestureHandlerRootView style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.fullScreenOverlay}
              onPress={handleCloseFullScreen}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </GestureHandlerRootView>
        )}
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
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
