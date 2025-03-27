import React from 'react';
import { Svg, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

// Reusable gradient text component
function GradientText({ 
  text, 
  fontSize = 12, 
  fontWeight = "600", 
  width = "100%", 
  height = "100%", 
  gradientColors = [],
  x = "50%",
  y = "50%",
  textAnchor = "middle",
  alignmentBaseline = "central"
}) {
  // Default gradient colors if none provided
  const colors = gradientColors.length > 0 ? gradientColors : [
    { offset: "0%", color: "#009FAD" },
    { offset: "25%", color: "#00707A" },
    { offset: "50%", color: "#009FAD" },
    { offset: "75%", color: "#00707A" },
    { offset: "100%", color: "#009FAD" }
  ];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="textGradient" x1="0" y1="0" x2="100%" y2="0">
          {colors.map((stop, index) => (
            <Stop key={index} offset={stop.offset} stopColor={stop.color} />
          ))}
        </LinearGradient>
      </Defs>
      <SvgText
        fill="url(#textGradient)"
        fontSize={fontSize}
        fontWeight={fontWeight}
        x={x}
        y={y}
        textAnchor={textAnchor}
        alignmentBaseline={alignmentBaseline}
      >
        {text}
      </SvgText>
    </Svg>
  );
}

export default GradientText;
