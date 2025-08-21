import React from 'react';
import {View, StyleSheet} from 'react-native';
import Progress from './Progress';
import Milestone from './Milestone';

function Rule(props) {
  const {rule, rules} = props;
  const {totalSegments, filledSegments, isAchieved, isNext} = rule;

  return (
    <View style={styles.container}>
      <Progress
        totalSegments={totalSegments}
        filledSegments={filledSegments}
        rules={rules}
      />
      <Milestone
        rule={rule}
        isAchieved={isAchieved}
        isNext={isNext}
        rules={rules}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Rule;
