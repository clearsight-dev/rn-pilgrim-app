import React from "react";
import { View, StyleSheet } from "react-native";
import { useShimmerAnimation } from "./useShimmerAnimation";
import { ShimmerOverlay } from "./ShimmerOverlay";

export const GridSkeletonLoader = ({ width }: { width: number }) => {
  const itemWidth = width / 3.5;
  const translateX = useShimmerAnimation(width);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}> 
        <View style={styles.titlePlaceholder} />
        <View style={{ alignSelf: "center" }}>
          <View style={styles.subtitlePlaceholder} />
        </View>
      </View>
      <View style={styles.celebsContainer}>
        {[...Array(6)].map((_, index) => (
          <View key={index} style={[styles.celebItem, { width: itemWidth }]}>
            <View
              style={[
                styles.imageContainer,
                {
                  width: itemWidth,
                  height: itemWidth,
                  borderRadius: itemWidth / 2,
                  backgroundColor: "#E0E0E0",
                  overflow: "hidden",
                  borderColor: "transparent",
                  borderWidth: 0,
                },
              ]}
            >
              <ShimmerOverlay translateX={translateX} />
            </View>
            <View style={styles.textPlaceholder} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  subtitle: {
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  celebsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  celebItem: {
    alignItems: "center",
    marginBottom: 16,
  },
  imageContainer: {
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E6F7FA",
    marginBottom: 12,
  },
  celebImage: {
    width: "100%",
    height: "100%",
  },
  celebTitle: {
    color: "#1A1A1A",
    lineHeight: 16,
    textAlign: "center",
  },
  // Skeleton styles
  titlePlaceholder: {
    width: 180,
    height: 32,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    marginBottom: 16,
  },
  subtitlePlaceholder: {
    width: 100,
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 6,
    alignSelf: "center",
  },
  underlinePlaceholder: {
    height: 10,
    width: 90,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  textPlaceholder: {
    width: 60,
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
});
