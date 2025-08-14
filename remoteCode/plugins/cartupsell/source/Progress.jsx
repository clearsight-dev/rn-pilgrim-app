import React from 'react';
import {View, StyleSheet} from 'react-native';

function Progress(props) {
  const {totalSegments, filledSegments} = props;
  return (
    <View style={styles.container}>
      <View style={[styles.filled, {flex: filledSegments}]} />
      <View style={[styles.unfilled, {flex: totalSegments - filledSegments}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 18,
  },
  unfilled: {
    height: 3,
    backgroundColor: '#c1c1c1',
  },
  filled: {
    height: 3,
    backgroundColor: '#00726C',
  },
});

export default Progress;
