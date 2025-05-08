import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from '../../../../../extractedQueries/ImageComponent';
import RatingPill from '../../../../../extractedQueries/RatingPill';
import moment from 'moment';
import { colors, FONT_FAMILY } from '../../../../../extractedQueries/theme';
import { Portal } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BackHandler } from 'react-native';

const ReviewCard = ({ review }) => {
  const { title, body, rating, verified, created_at, name, pictures } = review;
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // Format the date as time ago
  const getTimeAgo = (date) => {
    if (!date) return '';

    const now = moment();
    const reviewDate = moment(date);
    const diffYears = now.diff(reviewDate, 'years');
    const diffMonths = now.diff(reviewDate, 'months');
    const diffDays = now.diff(reviewDate, 'days');
    const diffHours = now.diff(reviewDate, 'hours');

    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return 'just now';
    }
  };

  const timeAgo = getTimeAgo(created_at);
  return (
    <View style={styles.container}>
      {/* Review Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <RatingPill rating={rating} size={16} />
          <Text style={styles.date}>{timeAgo}</Text>
        </View>
      </View>

      {/* Review Title */}
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Review Body */}
      {body && <Text style={styles.body}>{body}</Text>}

      {/* Verified Badge */}
      {verified === 'verified-purchase' && (
        <View style={styles.verifiedContainer}>
          <Text style={styles.verifiedText}>Verified Purchase</Text>
        </View>
      )}

      {/* Reviewer Name */}
      <Text style={styles.name}>{name || 'Anonymous'}</Text>

      {/* Review Images */}
      {pictures && pictures.length > 0 && (
        <View style={styles.imagesContainer}>
          {pictures.map((picture, index) => (
            <TouchableOpacity
              key={`${picture.id}-${index}`}
              onPress={() => handleImagePress(picture.url)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: picture.url }}
                style={styles.image}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Full Screen Image Portal */}
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
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark10
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.dark60,
    marginLeft: 9,
  },
  title: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: colors.dark100,
  },
  body: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.regular,
    color: colors.dark100,
    marginBottom: 12,
    lineHeight: 20,
  },
  verifiedContainer: {
    backgroundColor: colors.dark10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.secondaryMain,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.regular,
    color: colors.dark60,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  image: {
    backgroundColor: colors.dark10,
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
});

export default ReviewCard;
