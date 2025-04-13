import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
} from 'react-native';
import {Image} from '../../../../extractedQueries/ImageComponent';
import { useDispatch } from 'react-redux';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import { typography } from '../../../../extractedQueries/theme';

const QuickCollections = ({ 
  collections = []
}) => {
  const dispatch = useDispatch();
  const {width: screenWidth} = useApptileWindowDims();
  
  // Calculate item dimensions for a 4x2 grid
  const itemWidth = (screenWidth - 48 - 8) / 4; // (screen width - horizontal padding) / 4 columns
  const itemHeight = itemWidth; // Square items
  
  // Handle collection press
  const handleCollectionPress = (collectionHandle) => {
    dispatch(navigateToScreen('Collection', { collectionHandle }));
  };
  
  return (
    <View style={styles.container}>
      {/* Grid */}
      <View style={styles.gridContainer}>
        {collections.map((item, index) => (
          <Pressable
            key={item.collection + index}
            style={({pressed}) => [
              styles.gridItem,
              { width: itemWidth, height: itemHeight },
              pressed && {opacity: 0.5}
            ]}
            onPress={() => handleCollectionPress(item.collection)}
          >
            {/* Gradient Background */}
            <GradientBackground
              style={styles.gradientContainer}
              gradientColors={[
                { offset: "0%", color: "#FFFFFF", opacity: 0.1 },
                { offset: "100%", color: "#D6F2F4", opacity: 1 },
              ]}
              gradientDirection="vertical"
              borderRadius={8}
            >
              {/* Background Image */}
              <Image
                source={{ uri: item.urls[0] }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            </GradientBackground>
            
            {/* Title */}
            <View style={styles.itemTitleContainer}>
              <Text style={[typography.subHeading12, styles.itemTitle]}>{item.title}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginTop: 32,
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
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 8,
  },
  itemImage: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: 20
  },
  itemTitleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    textAlign: 'center',
  },
});

export default QuickCollections;
