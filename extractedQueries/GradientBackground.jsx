import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

/**
 * A reusable SVG gradient background component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.style - Additional styles for the container
 * @param {Array} props.gradientColors - Array of gradient color objects with offset and color properties
 * @param {string} props.gradientDirection - Direction of gradient ('vertical' or 'horizontal')
 * @param {number} props.borderRadius - Border radius for the gradient background
 * @param {Object} props.children - Child components to render on top of the gradient
 */
const GradientBackground = ({ 
  style = {}, 
  gradientColors = [], 
  gradientDirection = 'vertical',
  borderRadius = 0,
  children 
}) => {
  // State to track the dimensions of the container
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Default gradient colors if none provided
  const colors = gradientColors.length > 0 ? gradientColors : [
    { offset: "0%", color: "#00AEBD", opacity: 1 },
    { offset: "100%", color: "#007F89", opacity: 1 }
  ];

  // Set gradient coordinates based on direction
  const gradientProps = gradientDirection === 'vertical' 
    ? { x1: "0%", y1: "0%", x2: "0%", y2: "100%" }
    : { x1: "0%", y1: "0%", x2: "100%", y2: "0%" };

  return (
    <View 
      style={[{ position: 'relative' }, style]}
      onLayout={ev => {
        const { width, height } = ev.nativeEvent.layout;
        if (Math.abs(width - dimensions.width) > 1 || Math.abs(height - dimensions.height) > 1) {
          setDimensions({ width, height });
        }
      }}
    >
      {/* SVG Gradient Background */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Svg 
          style={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            bottom: 0, 
            right: 0,
            zIndex: 0
          }} 
          width={dimensions.width}
          height={dimensions.height}
        >
          <Defs>
            <LinearGradient id="gradient" {...gradientProps}>
              {colors.map((stop, index) => (
                <Stop 
                  key={index} 
                  offset={stop.offset} 
                  stopColor={stop.color} 
                  stopOpacity={stop.opacity || 1} 
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#gradient)"
          />
        </Svg>
      )}
      
      {/* Child components */}
      <View style={{ zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default GradientBackground;
