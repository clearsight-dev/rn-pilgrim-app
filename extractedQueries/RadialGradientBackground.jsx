import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

/**
 * A reusable SVG radial gradient background component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.style - Additional styles for the container
 * @param {Array} props.gradientColors - Array of gradient color objects with offset and color properties
 * @param {Object} props.gradientCenter - Center point of the radial gradient (default: {x: '50%', y: '50%'})
 * @param {string} props.gradientRadius - Radius of the radial gradient (default: '50%')
 * @param {number} props.borderRadius - Border radius for the gradient background
 * @param {Object} props.children - Child components to render on top of the gradient
 */
const RadialGradientBackground = ({ 
  style = {}, 
  gradientColors = [], 
  gradientCenter = { x: '50%', y: '50%' },
  gradientRadius = '50%',
  borderRadius = 0,
  containerStyles,
  children 
}) => {
  // State to track the dimensions of the container
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Default gradient colors if none provided
  const colors = gradientColors.length > 0 ? gradientColors : [
    { offset: "0%", color: "#00AEBD", opacity: 1 },
    { offset: "100%", color: "#007F89", opacity: 1 }
  ];

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
      {/* SVG Radial Gradient Background */}
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
            <RadialGradient 
              id="radialGradient" 
              cx={gradientCenter.x} 
              cy={gradientCenter.y} 
              rx={gradientRadius} 
              ry={gradientRadius} 
              gradientUnits="userSpaceOnUse"
            >
              {colors.map((stop, index) => (
                <Stop 
                  key={index} 
                  offset={stop.offset} 
                  stopColor={stop.color} 
                  stopOpacity={stop.opacity || 1} 
                />
              ))}
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#radialGradient)"
          />
        </Svg>
      )}
      
      {/* Child components */}
      <View style={[containerStyles, {zIndex: 1}]}>
        {children}
      </View>
    </View>
  );
};

export default RadialGradientBackground;
