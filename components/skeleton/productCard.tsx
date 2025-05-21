import React from "react";
import { View, StyleSheet } from "react-native";
import { useShimmerAnimation } from "./useShimmerAnimation";
import { ShimmerOverlay } from "./ShimmerOverlay";

export function RelatedProductCardSkeleton({ width }: { width?: number }) {
  const translateX = useShimmerAnimation(200);

  return (
    <View style={[styles.skelContainer, width ? { width } : {}]}>
      <View style={styles.skelPromoTag} />
      <View style={styles.skelImageContainer}>
        <ShimmerOverlay translateX={translateX} />
      </View>
      <View style={styles.skelDetailsContainer}>
        <View style={styles.skelLabel} />
        <View style={styles.skelTitle} />
        <View style={styles.skelSubtitle} />
        <View style={styles.skelSubtitle} />
        <View style={styles.skelPriceContainer}>
          <View style={styles.skelPrice} />
        </View>
        <View style={styles.skelButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skelContainer: {
    width: 184,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginRight: 12,
    borderRadius: 8,
  },
  skelPromoTag: {
    position: "absolute",
    top: 8,
    left: 0,
    width: 80,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    zIndex: 1,
  },
  skelImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    marginBottom: 8,
  },
  skelImageShimmer: {
    flex: 1,
    backgroundColor: "#f6f7f8",
    opacity: 0.6,
    shadowColor: "#fff",
    shadowOffset: { width: 50, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  skelDetailsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  skelLabel: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 6,
  },
  skelTitle: {
    width: "90%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 6,
  },
  skelSubtitle: {
    width: "80%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 6,
  },
  skelPriceContainer: {
    marginTop: 6,
  },
  skelPrice: {
    width: 60,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  skelButton: {
    marginTop: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
  },
});
