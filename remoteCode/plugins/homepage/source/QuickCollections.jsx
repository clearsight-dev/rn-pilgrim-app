import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from '../../../../extractedQueries/ImageComponent';
import { useDispatch } from 'react-redux';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
import { typography } from '../../../../extractedQueries/theme';

const QuickCollections = ({
  config = {}
}) => {

  const {title, items=[], layout = {}, style={} } = config;
  const { columns = 4 } = layout;
  const dispatch = useDispatch();
  const { width: screenWidth } = useApptileWindowDims();

  // Calculate item dimensions for a 4x2 grid
  const itemWidth = (screenWidth - 48 - 8) / columns; // (screen width - horizontal padding) / 4 columns

  // Handle collection press
  const handleCollectionPress = (collectionHandle) => {
    dispatch(navigateToScreen('Collection', { collectionHandle }));
  };

  return (
    <View style={styles.container}>
      {/* Grid */}
      {title && <Text style={[styles.headingText, typography.heading19]}>{title}</Text>}
      <View style={styles.gridContainer}>
        {items.map((item, index) => (
          <Pressable
            key={item.collection + index}
            style={({ pressed }) => [
              styles.gridItem,
              { width: itemWidth},
              pressed && { opacity: 0.5 }
            ]}
            onPress={() => handleCollectionPress(item.collection)}
          >
            <Image
              source={{ uri: item?.image?.value || item?.url || item?.urls[Math.floor(item?.urls.length / 2)] }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4, // Compensate for item margin
  },
  gridItem: {
    margin: 4,
    overflow: 'hidden',
    position: 'relative'
  },
  itemImage: {
    aspectRatio: 0.71
  },
  headingText: {
    marginBottom: 16
  }
});

export default QuickCollections;
