import { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";

export const useShimmerAnimation = (range: number = 200, duration: number = 1500) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        easing: Easing.ease,
        useNativeDriver: true, // keep false if using transform with layout
      })
    ).start();
  }, [shimmerAnim, duration]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-range, range],
  });

  return translateX;
};
