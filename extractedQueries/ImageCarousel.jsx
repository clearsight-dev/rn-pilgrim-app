import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Image,
  FlatList
} from 'react-native';
import AutoScrollBubbles from './AutoScrollBubbles';
import ScrollBubbles from './ScrollBubbles';

// Reusable image carousel component with auto-scrolling and manual interaction
export default function ImageCarousel({ images, width }) {
  const scrollView = useRef();
  const scrollBubblesRef = useRef();
  const currentIndexRef = useRef(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const inactivityTimerRef = useRef(null);
  
  // Function to handle automatic index changes
  const handleAutoIndexChange = useCallback((index) => {
    if (scrollView.current && index < images?.length) {
      scrollView.current.scrollToIndex({
        index: index,
        animated: true
      });
      currentIndexRef.current = index;
    }
  }, [images?.length]);
  
  // Function to calculate layout for FlatList items
  const getItemLayout = useCallback((data, index) => ({
    length: width,
    offset: width * index,
    index
  }), [width]);
  
  // Function to handle manual bubble press
  const handleBubblePress = useCallback((index) => {
    if (scrollView.current && index < images?.length) {
      scrollView.current.scrollToIndex({
        index: index,
        animated: true
      });
      currentIndexRef.current = index;
      
      // Only update userInteracted state if it's changing
      if (!userInteracted) {
        setUserInteracted(true);
      }
      
      resetInactivityTimer();
    }
  }, [images?.length, userInteracted]);
  
  // Function to handle scroll events
  const handleScroll = useCallback((event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    
    if (index !== currentIndexRef.current && index >= 0 && index < images.length) {
      currentIndexRef.current = index;
      
      // Update the ScrollBubbles component via imperative handle
      if (scrollBubblesRef.current) {
        scrollBubblesRef.current.setCurrentIndex(index);
      }
      
      // Only set userInteracted if it's not already true
      if (!userInteracted) {
        setUserInteracted(true);
      }
      
      resetInactivityTimer();
    }
  }, [width, images?.length, userInteracted]);
  
  // Function to reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set a new timer for 2 minutes (120000 ms)
    inactivityTimerRef.current = setTimeout(() => {
      setUserInteracted(false);
    }, 120000);
  }, []);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

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
        pagingEnabled={true}
        keyExtractor={item => item.id || item.url}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure - wait a bit and try again
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            if (scrollView.current) {
              scrollView.current.scrollToIndex({ 
                index: info.index, 
                animated: true 
              });
            }
          });
        }}
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
          );
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
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
        {userInteracted ? (
          <ScrollBubbles 
            ref={scrollBubblesRef}
            numBubbles={images.length} 
            currentIndex={currentIndexRef.current}
            onBubblePress={handleBubblePress}
          />
        ) : (
          <AutoScrollBubbles 
            numBubbles={images.length} 
            onIndexChange={handleAutoIndexChange}
            startIndex={currentIndexRef.current}
          />
        )}
      </View>
    </View>
  );
}
