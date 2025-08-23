/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import GradientBackground from '../../../../extractedQueries/GradientBackground';
import {CartFilled} from './icons/cartFilled';
import {CartOutline} from './icons/cartOutline';

const filledMilestone = (
  <GradientBackground
    gradientColors={[
      {offset: '0%', color: '#00726C'},
      {offset: '65%', color: '#00AEBD'},
    ]}
    style={{
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    borderRadius={25}>
    <CartFilled />
  </GradientBackground>
);

const outlinedMilestone = (isNext = false) => (
  <View
    style={{
      padding: 8,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: !isNext ? '#c1c1c1' : '#00726C',
    }}>
    <CartOutline isNext={isNext} />
  </View>
);

function Milestone(props) {
  const {rule, isAchieved, isNext, rules} = props;
  return (
    <View
      style={[styles.container, {marginLeft: rules?.length > 1 ? 60 : 180}]}>
      {isAchieved ? filledMilestone : outlinedMilestone(isNext)}
      <View style={styles.milestoneTextContainer}>
        <Text
          style={[
            styles.milestoneText,
            {color: isAchieved ? '#00726C' : '#3f3f3f'},
          ]}>
          {rule.rule_name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    height: 70,
  },
  milestoneTextContainer: {
    width: 80,
    height: 150,
    position: 'absolute',
    top: 40,
    left: -20,
  },
  milestoneText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Milestone;
