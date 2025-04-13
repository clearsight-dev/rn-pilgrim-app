import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, Animated, Pressable } from 'react-native';

// ScrollBubbles component that displays pagination with the current index highlighted
// No progress bar animation, just expanded bubbles for the current index
const ScrollBubbles = forwardRef(function ScrollBubbles({ 
  numBubbles, 
  onBubblePress, 
  style 
}, ref) {
  // console.log("==================================")
  // console.log("Rendering scrollBubbles");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastForcedRerender, setLastForcedRerender] = useState(Date.now());
  const lastIndex = useRef(currentIndex);
  // Create animated values for each bubble
  const animatedValues = useRef({
    currentBubbleWidth: new Animated.Value(2),
    nextBubbleWidth: new Animated.Value(1),
  }).current;

  const runningAnimations = useRef({
    currentBubbleAnim: null,
    nextBubbleAnim: null,
  });

  // console.log("lastIndex: ", lastIndex.current, "requiredIndex: ", currentIndex);
  
  // Expose methods via imperative handle
  useImperativeHandle(ref, () => ({
    setCurrentIndex: (index) => {
      // console.log("Setting current scroll bubble")
      if (index !== lastIndex.current && index >= 0 && index < numBubbles) {
        // Trigger a forced re-render to reattache animated nodes
        setLastForcedRerender(Date.now());
        console.log("Last forced rerender: ", lastForcedRerender);
        setCurrentIndex(index);
        animateBubbleToCurrent(lastIndex, index);
      }
    },
    getCurrentIndex: () => lastIndex.current
  }));

  // Function to update bubble animations
  const animateBubbleToCurrent = (lastIndex, requiredCurrentIndex) => {
    // console.log("---------------------------------------------------------------")
    // console.log("Animating from: ", lastIndex.current, " to: ", requiredCurrentIndex)
    if (requiredCurrentIndex !== lastIndex.current) {
      if (runningAnimations.current.currentBubbleAnim) {
        runningAnimations.current.currentBubbleAnim.stop();
      }

      if (runningAnimations.current.nextBubbleAnim) {
        runningAnimations.current.nextBubbleAnim.stop();
      }
      const ANIMATION_DURATION = 200;
      runningAnimations.current.currentBubbleAnim = Animated.timing(animatedValues.currentBubbleWidth, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: false
      });

      runningAnimations.current.nextBubbleAnim = Animated.timing(animatedValues.nextBubbleWidth, {
        toValue: 2,
        duration: ANIMATION_DURATION,
        useNativeDriver: false
      });

      Animated.parallel([
        runningAnimations.current.currentBubbleAnim,
        runningAnimations.current.nextBubbleAnim
      ])
      .start(({finished}) => {
        if (finished) {
          // console.log("Animation finished setting current to: ", 2, "next to: ", 1);
          lastIndex.current = requiredCurrentIndex;
          // console.log("Setting updated currentIndex");
          setLastForcedRerender(Date.now());
          lastIndex.current = requiredCurrentIndex;
          animatedValues.currentBubbleWidth.setValue(2);
          animatedValues.nextBubbleWidth.setValue(1);
        }
      });      
    } else {
      console.log("current index is at requested index. No need to update");
    }
  };

  useEffect(() => {
    animateBubbleToCurrent(lastIndex, 0);
  }, []);
  
  const nextBubbleInterpolatedWidth = Animated.add(7, 
    Animated.multiply(1, 
      animatedValues.nextBubbleWidth.interpolate({
        inputRange: [1, 2],
        outputRange: [1, 18]
      })
    )
  );

  const currentBubbleInterpolatedWidth = Animated.add(7, 
    Animated.multiply(1, 
      animatedValues.currentBubbleWidth.interpolate({
        inputRange: [1, 2],
        outputRange: [1, 18]
      })
    )
  );

  const unAnimatedWidth = 7 + (1 * 1);

  let bubbles = [];
  if (currentIndex === lastIndex.current) {
    // console.log("No animations running")
    // no animation is going on.
    for (let i = 0; i < numBubbles; ++i) {
      let width = unAnimatedWidth;
      if (i === currentIndex) {
        width = currentBubbleInterpolatedWidth;
      }

      bubbles.push(
        <Pressable 
          key={`bubble-${i}`}
          onPress={() => onBubblePress && onBubblePress(i)}
          activeOpacity={0.7}
        >
          <Animated.View 
            style={{
              margin: 3,
              width, 
              height: 8, 
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "#cccccccc", 
              backgroundColor: "#ffffff",
              // Add shadow for visibility on white backgrounds
            }}
          />
        </Pressable>
      );
    }
  } else {
    // console.log("Attaching animated values")
    for (let i = 0; i < numBubbles; ++i) {
      let width = unAnimatedWidth;
      if (i === lastIndex.current) {
        width = currentBubbleInterpolatedWidth;
        // console.log("currentBubbleAnimation attached to index: ", i);
      } else if (i === currentIndex) {
        // console.log("nextBubbleAnimation attached to index: ", i);
        width = nextBubbleInterpolatedWidth;
      }

      bubbles.push(
        <Pressable 
          key={`bubble-${i}`}
          onPress={() => onBubblePress && onBubblePress(i)}
          activeOpacity={0.7}
        >
          <Animated.View 
            style={{
              margin: 3,
              width, 
              height: 8, 
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "#cccccccc", 
              backgroundColor: "#ffffff",
              // Add shadow for visibility on white backgrounds
            }}
          />
        </Pressable>
      );
    }
  }

  return (
    <View style={[{flexDirection: 'row', justifyContent: 'center', paddingBottom: 8}, style]}>
      {bubbles}
    </View>
  );
});

export default ScrollBubbles;
