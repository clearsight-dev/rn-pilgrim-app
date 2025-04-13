import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Star from './Star';
import { FONT_FAMILY } from './theme';

const RatingPill = ({ rating, size = 16, backgroundColor = '#00909E', textColor = '#FFFFFF' }) => {
  return (
    <View style={[styles.ratingPill, { backgroundColor }]}>
      <Star fillPercentage={1} size={size} color={textColor} />
      <Text style={[styles.ratingText, { color: textColor, fontSize: size - 2 }]}>
        {typeof rating === 'number' ? rating.toFixed(1) : rating}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ratingPill: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default RatingPill;
