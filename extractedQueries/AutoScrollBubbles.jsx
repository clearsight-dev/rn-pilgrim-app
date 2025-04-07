import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

// AutoScrollBubbles component for animated pagination that automatically changes index
export default function AutoScrollBubbles({ numBubbles, onIndexChange, style, startIndex = 0 }) {
  const BUBBLE_DURATION = 300;
  const PROGRESS_DURATION = 2000;
  const animationProgress = useRef(
    new Array(numBubbles).fill(0).map(() => new Animated.Value(1))
  ).current;
  const progressBarAnimation = useRef(new Animated.Value(0)).current;
  const bubbles = new Array(numBubbles).fill(0);

  const animationIndex = useRef(startIndex);
  
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
        let nextIndex = (animationIndex.current + 1) % numBubbles;
        if (onIndexChange) {
          onIndexChange(nextIndex);
        }
        if (finished) {
          let nextNodeIndex = (i + 1) % numBubbles;
          let nextNode = animationProgress[nextNodeIndex];
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
              runAnimation();
            } else if (cleanup) {
              animationIndex.current = 0;
              animationProgress.map(node => {
                node.setValue(1);
              });
            }
          });     
        }
      });
    }

    const timeout = setTimeout(() => {
      runAnimation();
    }, 2 * BUBBLE_DURATION);

    return () => {
      clearTimeout(timeout);
      cleanup = true;
    };
  }, [animationProgress, numBubbles, onIndexChange]);

  // Reset animation to start from a specific index
  useEffect(() => {
    animationIndex.current = startIndex;
    // Reset all nodes to default state
    animationProgress.forEach((node, idx) => {
      node.setValue(idx === startIndex ? 2 : 1);
    });
    progressBarAnimation.setValue(0);
  }, [startIndex, animationProgress, progressBarAnimation]);

  return (
    <View style={[{flexDirection: 'row', justifyContent: 'center', paddingBottom: 8}, style]}>
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
                backgroundColor: "#ffffff",
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
          );
        })
      }
    </View>
  );
}
