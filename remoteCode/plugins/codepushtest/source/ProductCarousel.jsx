import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text,
  Image,
  Animated,
  FlatList,
  StyleSheet
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

// ScrollBubbles component for animated pagination
export function ScrollBubbles({numBubbles, onIndexChange, style}) {
  const BUBBLE_DURATION = 300;
  const PROGRESS_DURATION = 2000;
  const animationProgress = useRef(
    new Array(numBubbles).fill(0).map(() => new Animated.Value(1))
  ).current;
  const progressBarAnimation = useRef(new Animated.Value(0)).current;
  const bubbles = new Array(numBubbles).fill(0)

  const animationIndex = useRef(0);
  useEffect(() => {
    let cleanup = false;
    function runAnimation() {
      
      let i = animationIndex.current;
      const animationNode = animationProgress[i];
      Animated.sequence([
        Animated.timing(animationNode, {
          toValue: 2,
          duration: BUBBLE_DURATION,
          useNativeDriver: false
        }),
        Animated.timing(progressBarAnimation, {
          toValue: 1,
          duration: PROGRESS_DURATION,
          useNativeDriver: false
        })
      ])
      .start((finished) => {
        let nextIndex = (animationIndex.current + 1) % numBubbles
        if (onIndexChange) {
          onIndexChange(nextIndex)
        }
        if (finished) {
          let nextNodeIndex = (i + 1) % numBubbles
          let nextNode = animationProgress[nextNodeIndex]
          // After animation for expansion is done,
          // collapse the expanded node back to original width
          // and simultaneously expand the next node to expanded width
          Animated.parallel([
            Animated.timing(progressBarAnimation, {
              toValue: 0,
              duration: BUBBLE_DURATION,
              useNativeDriver: false
            }),
            Animated.timing(animationNode,
              {
                toValue: 1,
                duration: BUBBLE_DURATION,
                useNativeDriver: false
              }
            ),
            Animated.timing(nextNode,
              {
                toValue: 2,
                duration: BUBBLE_DURATION,
                useNativeDriver: false
              }
            )
          ])
          .start(({finished}) => {
            if (finished && !cleanup) {
              animationIndex.current = nextIndex;
              // once the next node has been expanded, 
              // start over if effect hasn't been cleaned up
              runAnimation()
            } else if (cleanup) {
              animationIndex.current = 0;
              animationProgress.map(node => {
                node.setValue(1)
              })
            }
          })     
        }
      })
    }

    runAnimation()
    return () => {
      cleanup = true;
    }
  }, [animationIndex.current, animationProgress, onIndexChange])

  return (
    <View style={{flexDirection: 'row', justifyContent: 'center', paddingBottom: 8}}>
      { 
        bubbles.map((_, i) => {
          return (
            <Animated.View 
              key={`bubble-${i}`}
              style={{
                margin: 3,
                width: Animated.add(7, 
                  Animated.multiply(1, 
                    animationProgress[i].interpolate({
                      inputRange: [1, 2],
                      outputRange: [1, 18]
                    })
                  )
                ), 
                height: 8, 
                borderRadius: 5,
                borderColor: "#ffffff", 
                backgroundColor: "#ffffff", // Changed from semi-transparent to solid white
                borderWidth: 2,
                // Add shadow for visibility on white backgrounds
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 3 // For Android
              }}
            >
              <Animated.View
                style={{
                  backgroundColor: 'gray',
                  width: progressBarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 20]
                  }),
                  height: 4,
                  borderRadius: 5,
                  opacity: animationProgress[i].interpolate({
                    inputRange: [1, 2],
                    outputRange: [0, 1]
                  })
                }}
              >
              </Animated.View>
            </Animated.View>
          )
        })
      }
    </View>);
}

// Carousel component that takes images as props
export function ImageCarousel({ images, width }) {
  const scrollView = useRef();
  const handleIndexChange = useCallback((index) => {
    if (scrollView.current && index < images?.length) {
      scrollView.current.scrollToIndex({
        index: index,
        animated: true
      })
    }
  }, [images?.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'relative'
      }}
    >
      <FlatList
        ref={scrollView}
        data={images}
        style={{
          width: width,
        }}
        horizontal={true}
        keyExtractor={item => item.id || item.url}
        renderItem={({item}) => {
          return (
            <Image 
              source={{uri: item.url}}
              resizeMode="contain"
              style={{
                width: width,
                aspectRatio: 1
              }}
            />   
          )
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
      <View
        style={{
          position: "absolute",
          height: 20,
          width: 0.5 * width,
          bottom: 0,
          left: 0.25 * width,
        }}
      >
        <ScrollBubbles numBubbles={images.length} onIndexChange={handleIndexChange}/> 
      </View>
    </View>
  );
}

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
