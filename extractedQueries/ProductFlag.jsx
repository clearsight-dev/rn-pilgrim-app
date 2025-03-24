import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Text } from 'react-native-svg';

const ProductFlag = ({ 
  label, 
  color = '#00726C', 
  style, 
  height = 26, 
  width = 100, 
  baseLineOffset = 6,
  paddingLeft = 6,
  fontSize = 10
}) => {
  return (
    <View style={[styles.labelWrapper, style, {height, width}]}>
      <Svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        fill="none" 
        style={{position: 'absolute'}}
      >
        <Path 
          d={`M${width} ${height}
              L0 ${height}
              L0 0
              L${width} 0
              L${width - 10} ${height/2}
              L${width} ${height}
              Z
          `} 
          fill={color} 
          stroke={color} 
          strokeWidth="1.5"
        />
        <Text 
          x={paddingLeft} y={height - baseLineOffset} 
          fontSize={fontSize} 
          fontWeight="bold" 
          fill="white"
        >
          {label}
        </Text>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  labelWrapper: {
    position: 'absolute',
    top: 20,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 10,
  },
});

export default ProductFlag;
