import React from 'react';
import {View, StyleSheet} from 'react-native';
import Progress from './Progress';
import Milestone from './Milestone';

function Rule(props) {
  const {rule, index} = props;
  const {totalSegments, filledSegments, isAchieved, isNext} = rule;

  console.log(
    `Rule ${index} - Segments: ${filledSegments}/${totalSegments}, Achieved: ${isAchieved}, Next: ${isNext}`,
  );
  return (
    <View style={styles.container}>
      <Progress totalSegments={totalSegments} filledSegments={filledSegments} />
      <Milestone rule={rule} isAchieved={isAchieved} isNext={isNext} />
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
