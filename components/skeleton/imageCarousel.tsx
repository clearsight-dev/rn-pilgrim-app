import React from "react";
import { View, StyleSheet } from "react-native";
import { useShimmerAnimation } from "./useShimmerAnimation";
import { ShimmerOverlay } from "./ShimmerOverlay";

export const SkeletonBanner = ({ width }: { width: number }) => {
  const translateX = useShimmerAnimation(width);

  return (
    <View
      style={[
        styles.skeletonContainer,
        { width, aspectRatio: 1.3, marginBottom: 20 },
      ]}
    >
      <ShimmerOverlay translateX={translateX} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    borderRadius: 8,
  },
});
