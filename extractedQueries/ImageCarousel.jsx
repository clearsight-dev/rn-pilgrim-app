import React, { 
  useRef, 
  useEffect, 
  useState, 
  useCallback, 
  useImperativeHandle, 
  forwardRef 
} from 'react';
import { 
  View, 
  Image,
  FlatList
} from 'react-native';
import AutoScrollBubbles from './AutoScrollBubbles';
import ScrollBubbles from './ScrollBubbles';

// Reusable image carousel component with auto-scrolling and manual interaction
export const Carousel = forwardRef(({ width, flatlistData, renderChildren, autoScroll = false }, ref) => {
  const scrollView = useRef(null);
  const scrollBubblesRef = useRef();
  const currentIndexRef = useRef(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const inactivityTimerRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      scrollToIndex: (index) => {
        if (scrollView.current && index >= 0 && index <= flatlistData.length) {
          scrollView.current.scrollToIndex({
            index, 
            animated: true
          });
        }
      }
    }
  }, [scrollView.current]);
  
  // Function to handle automatic index changes
  const handleAutoIndexChange = useCallback((index) => {
    if (scrollView.current && index < flatlistData?.length) {
      scrollView.current.scrollToIndex({
        index: index,
        animated: true
      });
      currentIndexRef.current = index;
    }
  }, [flatlistData?.length]);
  
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
  }, [flatlistData?.length, userInteracted]);
  
  // Function to handle scroll events
  const handleScroll = useCallback((event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    
    if (index !== currentIndexRef.current && index >= 0 && index < flatlistData.length) {
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
  }, [width, flatlistData?.length, userInteracted]);
  
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
    if (!autoScroll) {
      scrollBubblesRef.current.setCurrentIndex(0);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  if (!flatlistData || flatlistData.length === 0) {
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
        data={flatlistData}
        style={{
          width: width,
        }}
        horizontal={true}
        pagingEnabled={true}
        keyExtractor={(item, i) => item.id + item.url + i}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
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
        renderItem={renderChildren}
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
        {(userInteracted || !autoScroll) ? (
          <ScrollBubbles 
            ref={scrollBubblesRef}
            numBubbles={flatlistData.length} 
            currentIndex={currentIndexRef.current}
            onBubblePress={handleBubblePress}
          />
        ) : (
          <AutoScrollBubbles 
            numBubbles={flatlistData.length} 
            onIndexChange={handleAutoIndexChange}
            startIndex={currentIndexRef.current}
          />
        )}
      </View>
    </View>
  );
});

export default function ImageCarousel({ images, width, aspectRatio = 1 }) {
  return (
    <Carousel
      flatlistData={images}
      renderChildren={({item}, index) => {
        return (
          <Image 
            source={{uri: item.url + "-" + index}}
            resizeMode="contain"
            style={{
              width: width,
              aspectRatio,
              minHeight: 100,
            }}
          />   
        );
      }}
      width={width}
      aspectRatio={aspectRatio}
    />
  );
}