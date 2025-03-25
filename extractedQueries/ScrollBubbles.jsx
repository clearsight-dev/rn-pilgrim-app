import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, Animated, TouchableOpacity } from 'react-native';

// ScrollBubbles component that displays pagination with the current index highlighted
// No progress bar animation, just expanded bubbles for the current index
const ScrollBubbles = forwardRef(function ScrollBubbles({ numBubbles, currentIndex = 0, onBubblePress, style }, ref) {
  // Create animated values for each bubble
  const animatedValues = useRef(
    new Array(numBubbles).fill(0).map(() => new Animated.Value(1))
  ).current;
  
  // Internal ref to track current index
  const indexRef = useRef(currentIndex);
  
  // Expose methods via imperative handle
  useImperativeHandle(ref, () => ({
    setCurrentIndex: (index) => {
      if (index !== indexRef.current && index >= 0 && index < numBubbles) {
        indexRef.current = index;
        updateBubbleAnimations(index);
      }
    },
    getCurrentIndex: () => indexRef.current
  }));
  
  // Function to update bubble animations
  const updateBubbleAnimations = (index) => {
    // Reset all bubbles to normal size
    animatedValues.forEach((anim, idx) => {
      if (idx !== index) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        }).start();
      }
    });
    
    // Animate the current bubble to expanded size
    Animated.timing(animatedValues[index], {
      toValue: 2,
      duration: 300,
      useNativeDriver: false
    }).start();
  };
  
  // Update animations when currentIndex prop changes
  useEffect(() => {
    if (currentIndex !== indexRef.current) {
      indexRef.current = currentIndex;
      updateBubbleAnimations(currentIndex);
    }
  }, [currentIndex]);
  
  return (
    <View style={[{flexDirection: 'row', justifyContent: 'center', paddingBottom: 8}, style]}>
      {new Array(numBubbles).fill(0).map((_, i) => (
        <TouchableOpacity 
          key={`bubble-${i}`}
          onPress={() => onBubblePress && onBubblePress(i)}
          activeOpacity={0.7}
        >
          <Animated.View 
            style={{
              margin: 3,
              width: Animated.add(7, 
                Animated.multiply(1, 
                  animatedValues[i].interpolate({
                    inputRange: [1, 2],
                    outputRange: [1, 18]
                  })
                )
              ), 
              height: 8, 
              borderRadius: 5,
              borderColor: "#ffffff", 
              backgroundColor: "#ffffff",
              borderWidth: 2,
              // Add shadow for visibility on white backgrounds
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
              elevation: 3 // For Android
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
});

export default ScrollBubbles;
