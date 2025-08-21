/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet} from 'react-native';

function Progress(props) {
  const {totalSegments, filledSegments, rules} = props;
  return (
    <View style={[styles.container, {width: rules?.length > 1 ? 60 : 180}]}>
      <View style={[styles.filled, {flex: filledSegments}]} />
      <View style={[styles.unfilled, {flex: totalSegments - filledSegments}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
