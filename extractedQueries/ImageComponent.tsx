// ImageComponent.tsx

import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';

const Image = (props: FastImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.container, props.style]}>
      {!loaded && (
        <View style={styles.loader}/>
      )}
      <FastImage
        {...props}
        onLoadEnd={() => {
          setLoaded(true);
          props.onLoadEnd?.();
        }}
        style={[StyleSheet.absoluteFill, props.style]}
      /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
});

export { Image };
