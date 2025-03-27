import React from 'react';
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';

const Star = ({ fillPercentage = 0, size = 16, color = '#FFB800' }) => {
  // Ensure fillPercentage is between 0 and 1
  const normalizedFill = Math.max(0, Math.min(1, fillPercentage)) * 100;
  
  // Calculate the width of the clipping rectangle based on the fill percentage
  const starPath = "M50 5 L61 35 L95 38 L67 58 L75 91 L50 72 L25 91 L33 58 L5 38 L39 35 Z";
  const width = size;
  const height = size;

  return (
    <>
      <Svg width={width} height={height} viewBox="0 0 100 100">
        <Defs>
          {/* Clip Path for Partial Fill */}
          <ClipPath id="clip">
            <Rect x="0" y="0" width={normalizedFill} height={100} />
          </ClipPath>
        </Defs>
        {/* Outline */}
        <Path d={starPath} fill="none" stroke={color} strokeWidth={5} />
        {/* Filled Portion */}
        <Path d={starPath} fill={color} clipPath="url(#clip)" />
      </Svg>
    </>
  );
};

export default Star;
