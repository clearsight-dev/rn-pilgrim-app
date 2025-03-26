import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
import GradientBackground from '../../../../extractedQueries/GradientBackground';

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
    dispatch(navigateToScreen('NewCollection', { collectionHandle }));
  };
  
  return (
    <View style={styles.container}>
      {/* Grid */}
      <View style={styles.gridContainer}>
        {collections.map((item, index) => (
          <TouchableOpacity
            key={item.collection || index}
            style={[
              styles.gridItem,
              { width: itemWidth, height: itemHeight }
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
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
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
    color: '#1a1a1a',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default QuickCollections;
