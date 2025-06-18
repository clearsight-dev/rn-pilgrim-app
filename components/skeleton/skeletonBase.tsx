import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";

import { ShimmerOverlay } from "./ShimmerOverlay";
import { useShimmerAnimation } from "./useShimmerAnimation";

type SkeletonBaseProps = {
  style?: StyleProp<ViewStyle>;
};

const SkeletonBase: React.FC<SkeletonBaseProps> = ({ style }) => {
  const translateX = useShimmerAnimation(200);

  return (
    <View style={[styles.container, style]}>
      <ShimmerOverlay translateX={translateX} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    position: "relative",
  },
});

export default SkeletonBase;
