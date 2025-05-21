import React from "react";
import { View, StyleSheet } from "react-native";
import { useShimmerAnimation } from "./useShimmerAnimation";
import { ShimmerOverlay } from "./ShimmerOverlay";

export const QuickCollectionsSkeleton = ({
  columns = 4,
  aspectRatio = 0.71,
  itemWidth,
}) => {
  const translateX = useShimmerAnimation(itemWidth);

  const renderItem = (_, i) => (
    <View
      key={i}
      style={[styles.skeletonGridItem, { width: itemWidth, aspectRatio }]}
    >
      <ShimmerOverlay translateX={translateX} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleSkeleton} />
      <View style={styles.gridContainer}>
        {Array.from({ length: columns * 2 }).map(renderItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  headingText: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
  titleSkeleton: {
    width: 160,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  skeletonGridItem: {
    margin: 4,
    borderRadius: 6,
    height: 58,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    position: "relative",
  },
});
