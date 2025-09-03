/* eslint-disable no-shadow */
import React, {useMemo} from 'react';
import {Text, View, StyleSheet} from 'react-native';

function HeadingText({pointsToNextRule, nextRuleName, ruleType}) {
  const {headingText} = useMemo(() => {
    let headingText = <View />;
    if (ruleType === 'Quantity Based') {
      headingText = (
        <Text style={styles.headingText}>
          Add <Text style={styles.headingBoldText}>{pointsToNextRule}</Text>{' '}
          more eligible product/s to avail{' '}
          <Text style={styles.headingBoldText}>{nextRuleName}</Text>
        </Text>
      );
    } else {
      headingText = (
        <Text style={styles.headingText}>
          Add products worth ₹{' '}
          <Text style={styles.headingBoldText}>{pointsToNextRule}</Text> or more
          to get <Text style={styles.headingBoldText}>{nextRuleName}</Text>
        </Text>
      );
    }
    return {
      headingText,
    };
  }, [pointsToNextRule, nextRuleName, ruleType]);
  return (
    <View style={styles.headingContainer}>
      {!isNaN(pointsToNextRule) && pointsToNextRule > 0 ? (
        headingText
      ) : (
        <Text style={styles.headingText}>You have availed the best deal !</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    width: '100%',
    paddingEnd: 20,
  },
  headingText: {
    textAlign: 'center',
    color: '#4B2C20',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  headingBoldText: {
    fontWeight: 'bold',
  },
});

export default HeadingText;
