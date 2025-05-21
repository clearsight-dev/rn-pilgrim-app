import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from "react-native";

import { RelatedProductCardSkeleton } from "./productCard";
import { useShimmerAnimation } from "./useShimmerAnimation";
import { ShimmerOverlay } from "./ShimmerOverlay";

export const ChipCarouselSkeletonLoader = () => {
  const screenWidth = Dimensions.get("window").width;
  const translateX = useShimmerAnimation(screenWidth);

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skelTitleContainer}>
        <View style={{ flexGrow: 1 }}>
          <View style={styles.skelTitle} />
          <View style={styles.skelSubtitle} />
        </View>
        <View style={styles.skelSeeAllButton} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[...Array(8)].map((_, index) => (
          <View key={index} style={styles.chipPlaceholder}>
            <ShimmerOverlay translateX={translateX} />
          </View>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
      >
        <RelatedProductCardSkeleton />
        <RelatedProductCardSkeleton />
        <RelatedProductCardSkeleton />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  chipPlaceholder: {
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    marginRight: 12,
    overflow: "hidden",
    width: 80,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  skelTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  skelTitle: {
    width: 180,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  skelSubtitle: {
    marginTop: 8,
    width: 120,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  skelSeeAllButton: {
    width: 60,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
});
