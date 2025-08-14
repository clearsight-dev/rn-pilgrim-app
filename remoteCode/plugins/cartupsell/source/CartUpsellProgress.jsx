import React from 'react';
import {View, StyleSheet} from 'react-native';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import HeadingText from './HeadingText';
import Rule from './Rule';

const CartUpsellProgress = ({rules}) => {
  if (!Object.keys(rules)?.length) {
    return <View />;
  }

  return (
    <GradientBackground
      gradientColors={[
        {offset: '0%', color: '#fff'},
        {offset: '65%', color: '#E7F2F3'},
      ]}
      style={styles.gradient}>
      <HeadingText />
      <View style={styles.ruleContainer}>
        {rules.map((_, index) => {
          return (
            <Rule
              key={index}
              rules={rules}
              index={index}
              currentMilestone={500}
            />
          );
        })}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  ruleContainer: {
    width: '100%',
    marginTop: 16,
    marginRight: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default CartUpsellProgress;
