import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Portal } from '@gorhom/portal';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApptileWindowDims } from 'apptile-core';

const PhotosBottomSheet = forwardRef(function (props, ref) {
  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();
  const [sheetIsRendered, setSheetIsRendered] = useState(false);
  const sheetVisibility = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => {
    return {
      show: () => {
        setSheetIsRendered(true);
        Animated.timing(sheetVisibility, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    }
  }, [setSheetIsRendered, sheetVisibility.current]);

  if (!sheetIsRendered) return null;

  const handleClose = () => {
    Animated.timing(sheetVisibility, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(finished => {
      if (finished) {
        setSheetIsRendered(false);
      }
    });
  }

  return (
    <Portal hostName={'root'}>
      <GestureHandlerRootView 
        style={{
          width: screenWidth, 
          height: screenHeight, 
          position: 'absolute', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Top area pressable to close the sheet */}
        <Pressable 
          style={{
            width: screenWidth, 
            height: 0.3 * screenHeight,
            position: 'absolute',
            top: 0,
          }}
          onPress={handleClose}
        />
        
        {/* Bottom sheet content */}
        <Animated.View
          style={{
            width: screenWidth,
            height: 0.7 * screenHeight,
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            transform: [
              {
                translateY: sheetVisibility.interpolate({
                  inputRange: [0, 1], 
                  outputRange: [0.7 * screenHeight, 0]
                })
              }
            ]
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Customer Photos</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.content}>
              <Text style={styles.placeholderText}>
                All reviews will be shown here
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Portal>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    fontSize: 16,
    color: '#666666',
  },
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

export default PhotosBottomSheet;
