import React from 'react';
import {StyleSheet, Text as TextElement} from 'react-native';

export const ImageZoom = () => {
  return <TextElement style={styles.textStyles}>This feature can only be seen in mobile devices!</TextElement>;
};

const styles = StyleSheet.create({
  textStyles: {
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: 30,
    margin: 30,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 30,
  },
});