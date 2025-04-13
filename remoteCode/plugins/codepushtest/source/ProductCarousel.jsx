import React from 'react';
import { 
  View, 
  Text,
  StyleSheet
} from 'react-native';
import ProductFlag from '../../../../extractedQueries/ProductFlag';
import ImageCarousel from '../../../../extractedQueries/ImageCarousel';
import { FONT_FAMILY } from '../../../../extractedQueries/theme';

// Main ProductCarousel component
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
      {/* Use the ImageCarousel component */}
      <ImageCarousel images={formattedImages} width={screenWidth} />
      
      {/* Overlay label */}
      {productLabel && (
        <ProductFlag 
          label={productLabel} 
          color="#00726C" 
          style={styles.labelWrapper}
          fontSize={12}
          baseLineOffset={9}
        />
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
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  labelContainer: {
    backgroundColor: '#9C27B0', // Purple color from Figma
    paddingVertical: 4,
    paddingHorizontal: 12,
    height: 24, // Height from Figma
    justifyContent: 'center',
  },
  labelText: {
    color: 'white',
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    fontSize: 12
  },
});
