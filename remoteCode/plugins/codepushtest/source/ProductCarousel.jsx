import React, {useState} from 'react';
import {View, Text, Image, ScrollView, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
export default function ImageCarousel({ images, screenWidth, productLabel }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setActiveImageIndex(newIndex);
        }}
        style={styles.carouselContainer}
      >
        {images.map((imageUrl, index) => (
          <Image
            key={`image-${index}`}
            source={{ uri: imageUrl }}
            style={[styles.carouselImage, { width: screenWidth }]}
            resizeMode="contain"
          />
        ))}
      </ScrollView>
      
      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.paginationDot,
              index === activeImageIndex ? styles.paginationDotActive : {}
            ]}
          />
        ))}
      </View>
      
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
              stroke-width="1.5"
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
    fontWeight: 'bold',
    fontSize: 12
  },
});
