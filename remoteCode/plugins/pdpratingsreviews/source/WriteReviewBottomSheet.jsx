import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from '../../../../extractedQueries/BottomSheet';

const WriteReviewBottomSheet = forwardRef(function (props, ref) {
  return (
    <BottomSheet 
      ref={ref}
      title="Write a Review"
      sheetHeight={0.5}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>
            Review form will be implemented here.
          </Text>
        </View>
      </ScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default WriteReviewBottomSheet;
