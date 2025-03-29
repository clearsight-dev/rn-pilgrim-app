import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Lightning icon SVG component
const LightningIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path 
      d="M8.5 1L2 9.5H7.5L6.5 15L13 6.5H7.5L8.5 1Z" 
      fill="#A90A42" 
      stroke="#A90A42" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const TimerComponent = ({ 
  initialHours = 7, 
  initialMinutes = 54, 
  initialSeconds = 10,
  onTimerEnd = () => {} 
}) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  // useEffect(() => {
  //   let interval = null;
    
  //   if (isActive) {
  //     interval = setInterval(() => {
  //       if (seconds > 0) {
  //         setSeconds(seconds - 1);
  //       } else if (minutes > 0) {
  //         setMinutes(minutes - 1);
  //         setSeconds(59);
  //       } else if (hours > 0) {
  //         setHours(hours - 1);
  //         setMinutes(59);
  //         setSeconds(59);
  //       } else {
  //         setIsActive(false);
  //         onTimerEnd();
  //       }
  //     }, 1000);
  //   } else if (!isActive && (seconds !== 0 || minutes !== 0 || hours !== 0)) {
  //     clearInterval(interval);
  //   }
    
  //   return () => clearInterval(interval);
  // }, [isActive, seconds, minutes, hours, onTimerEnd]);

  // Format numbers to always have two digits
  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  return (
    <View style={styles.timerContainer}>
      <LightningIcon />
      <Text style={styles.timerText}>
        {hours}h : {formatNumber(minutes)}m : {formatNumber(seconds)}s
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#A90A42',
    paddingVertical: 4,
    paddingHorizontal: 6,
    gap: 2,
  },
  timerText: {
    color: '#A90A42',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.6,
  }
});

export default TimerComponent;
