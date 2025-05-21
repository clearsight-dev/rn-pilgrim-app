import React from "react";
import { View, StyleSheet } from "react-native";
import { ShimmerOverlay } from "./ShimmerOverlay";
import { useShimmerAnimation } from "./useShimmerAnimation";

export function CollectionHeaderSkeleton() {
  const translateX = useShimmerAnimation(200);

  return (
    <>
      {/* Image Skeleton */}
      <View style={styles.imageSkeletonContainer}>
        <ShimmerOverlay translateX={translateX} />
      </View>

      {/* Header Text and Product Count */}
      <View style={styles.headerContainer}>
        <View style={styles.titleSkeleton} />
        <View style={styles.countSkeleton} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  imageSkeletonContainer: {
    width: "100%",
    aspectRatio: 3.1, // approximate placeholder ratio
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    marginBottom: 8,
  },
  titleSkeleton: {
    width: "60%",
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  countSkeleton: {
    width: 100,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
});
