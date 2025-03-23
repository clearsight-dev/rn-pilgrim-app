import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable, FlatList } from 'react-native';
import { Portal } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApptileWindowDims } from 'apptile-core';
import ReviewCard from './ReviewCard';

const PhotosBottomSheet = forwardRef(function ({ reviews = [] }, ref) {
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
            <Text style={styles.title}>Customer Reviews</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <ReviewCard review={item} />}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.content}>
              <Text style={styles.placeholderText}>
                No reviews available
              </Text>
            </View>
          )}
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
  scrollContent: {
    padding: 16,
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
