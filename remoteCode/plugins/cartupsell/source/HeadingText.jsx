import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

function HeadingText({pointsToNextRule, nextRuleName, ruleType}) {
  const isQuantityBased = ruleType === 'Quantity Based';
  return (
    <View style={styles.headingContainer}>
      {!isNaN(pointsToNextRule) && pointsToNextRule > 0 ? (
        <Text style={styles.headingText}>
          Add {isQuantityBased ? '' : '₹'}{' '}
          <Text style={styles.headingBoldText}>{pointsToNextRule}</Text> more
          {isQuantityBased ? 'eligible product/s' : ''} to avail{' '}
          <Text style={styles.headingBoldText}>{nextRuleName}</Text>
        </Text>
      ) : (
        <Text style={styles.headingText}>
          You have availed{' '}
          <Text style={styles.headingBoldText}>{nextRuleName}</Text>
        </Text>
      )}
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
