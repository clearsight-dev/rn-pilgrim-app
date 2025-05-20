import React from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

type Props = {
  translateX: Animated.AnimatedInterpolation<string | number>;
  style?: ViewStyle;
};

export const ShimmerOverlay = ({ translateX, style }: Props) => {
  return (
    <Animated.View
      style={[
        styles.shimmer,
        { transform: [{ translateX }] },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});
