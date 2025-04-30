import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {Icon} from 'apptile-core';
import Star from '../../../../../extractedQueries/Star';

const StarRating = ({ rating = 0, size = 16, maxRating = 5, ratingCount }) => {
  // Ensure rating is between 0 and maxRating
  const normalizedRating = Math.max(0, Math.min(rating, maxRating));
  
  return (
    <View styles={{flexDirection: "column"}}>
      <View style={styles.container}>
        {[...Array(maxRating)].map((_, index) => {
          // Calculate fill percentage for each star
          let fillPercentage = 0;
          
          if (index < Math.floor(normalizedRating)) {
            // Full star
            fillPercentage = 1;
          } else if (index === Math.floor(normalizedRating)) {
            // Partial star
            fillPercentage = normalizedRating - Math.floor(normalizedRating);
          }
          
          return (
            <Star 
              key={index} 
              fillPercentage={fillPercentage} 
              size={size} 
              color={'#00909E'}
            />
          );
        })}
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
