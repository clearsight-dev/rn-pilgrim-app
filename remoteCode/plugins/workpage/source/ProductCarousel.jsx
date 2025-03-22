import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Carousel} from './component';

export default function ProductCarousel({ images, screenWidth, productLabel }) {
  // Format images for Carousel component if they're just URLs
  const formattedImages = images && images.length > 0 
    ? images.map((item, index) => {
        // If item is already an object with url property, return it as is
        if (typeof item === 'object' && item.url) {
          return item;
        }
        // If item is a string (URL), convert to object format
        return {
          id: `image-${index}`,
          url: item
        };
      })
    : [];
  
  if (!images || images.length === 0) {
    return (
      <View style={[styles.carouselContainer, { width: screenWidth }]}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No images available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.carouselWrapper}>
      {/* Use the Carousel component */}
      <Carousel images={formattedImages} width={screenWidth} />
      
      {/* Overlay label */}
      {productLabel && (
        <View style={styles.labelWrapper}>
          <Svg 
            width={106} 
            height={26} 
            viewBox="0 0 106 26" 
            fill="none" 
            style={{position: 'absolute'}}
          >
            <Path 
              d="M103.5 25L0 25L0 1L103.5 1L93.3197 13L103.5 25Z" 
              fill="#00726C" 
              stroke="#00726C" 
              strokeWidth="1.5"
            />
          </Svg>
          <Text style={styles.labelText}>{productLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  carouselWrapper: {
    position: 'relative',
  },
  carouselContainer: {
    height: 450,
  },
  carouselImage: {
    height: 450,
  },
  imagePlaceholder: {
    height: 450,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  labelWrapper: {
    position: 'absolute',
    top: 20,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 10
  },
  labelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
});
