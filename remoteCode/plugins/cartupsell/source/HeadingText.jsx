import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

function HeadingText() {
  return (
    <View style={styles.headingContainer}>
      <Text style={styles.headingText}>
        Add <Text style={styles.headingBoldText}>2</Text> more eligible
        product/s to avail{' '}
        <Text style={styles.headingBoldText}>Buy any 2 @ ₹699</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingContainer: {},
  headingText: {
    textAlign: 'center',
    color: '#000',
  },
  headingBoldText: {
    fontWeight: 'bold',
  },
});

export default HeadingText;
