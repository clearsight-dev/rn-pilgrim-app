import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {Icon} from 'apptile-core';
import Svg, { Path } from 'react-native-svg';

const Star = ({ filled, size = 16, color = '#FFB800' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const StarRating = ({ rating = 0, size = 16, maxRating = 5, ratingCount }) => {
  // Ensure rating is between 0 and maxRating
  const normalizedRating = Math.max(0, Math.min(rating, maxRating));
  
  return (
    <View styles={{flexDirection: "column"}}>
      <View style={styles.container}>
        {[...Array(maxRating)].map((_, index) => (
          <Star 
            key={index} 
            filled={index < normalizedRating} 
            size={size} 
            color={'#00909E'}
          />
        ))}
      </View>
      <View style={{flexDirection: 'row', marginTop: 2}}>
        <Text style={styles.dark}>29,000 Ratings</Text>
        <Text style={styles.dot}>·</Text>
        <Icon 
          iconType={'Material Icon'} 
          name={'check-decagram'} 
          style={{
            marginRight: 2,
            fontSize: 15,
            color: '#00AEEF'
          }}
        />
        <Text style={styles.dark}>{ratingCount || 0} Reviews</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  dark: {
    color: '#1A1A1A'
  },
  dot: {
    color: '#1A1A1A',
    marginLeft: 4,
    marginRight: 4,
  }
});

export default StarRating;
