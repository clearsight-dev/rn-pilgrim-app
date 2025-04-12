import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  StatusBar, 
  Dimensions, 
  Platform 
} from 'react-native';
import { Portal } from '@gorhom/portal';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useApptileWindowDims } from 'apptile-core';
import { colors, FONT_FAMILY } from './theme';

const BottomSheet = forwardRef(function ({ 
  title = 'Bottom Sheet',
  children,
  sheetHeightFraction = 0.5, // Default to 50% of screen height
  onClose = () => {}
}, ref) {
  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();
  const [sheetIsRendered, setSheetIsRendered] = useState(false);
  const sheetVisibility = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const screenDims = Dimensions.get('screen');
  // Threshold for considering a swipe as dismissal (1/5 of the screen height)
  const SWIPE_THRESHOLD = screenHeight * 0.2;

  const handleClose = () => {
    Animated.timing(sheetVisibility, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(finished => {
      if (finished) {
        setSheetIsRendered(false);
        onClose();
      }
    });
  }

  useImperativeHandle(ref, () => {
    return {
      show: () => {
        setSheetIsRendered(true);
        translateY.setValue(0);
        Animated.timing(sheetVisibility, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      },
      hide: handleClose
    }
  }, [setSheetIsRendered, sheetVisibility.current]);

  if (!sheetIsRendered) return null;

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // When the gesture ends, snap to either open or closed position
      const { translationY } = event.nativeEvent;
      
      if (translationY > SWIPE_THRESHOLD) {
        // If swiped down past threshold (1/5 of screen height), close the sheet
        handleClose();
      } else {
        // Otherwise, snap back to open position with a spring animation
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 10,
          speed: 12
        }).start();
      }
    }
  };

  const containerHeight = Platform.select({
    web: screenHeight,
    default: screenDims.height
  });

  return (
    <Portal hostName={'root'}>
      <GestureHandlerRootView 
        style={{
          width: screenWidth, 
          height: containerHeight ,
          position: 'absolute', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          top: -(StatusBar.currentHeight || 0)
        }}
      >
        {/* Overlay area with tap to close the sheet */}
        <TouchableOpacity
          style={{
            width: screenWidth, 
            height: (1 - sheetHeightFraction) * containerHeight,
            position: 'absolute',
            top: 0,
          }}
          onPress={handleClose}
          activeOpacity={1}
        />
        
        {/* Bottom sheet content */}
        <Animated.View
          style={{
            width: screenWidth,
            height: sheetHeightFraction * containerHeight,
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            transform: [
              {
                translateY: Animated.add(
                  sheetVisibility.interpolate({
                    inputRange: [0, 1], 
                    outputRange: [sheetHeightFraction * containerHeight, 0]
                  }),
                  // Only allow positive translation (downward)
                  translateY.interpolate({
                    inputRange: [-100, 0, 100, 200],
                    outputRange: [0, 0, 100, 200],
                    extrapolate: 'clamp'
                  })
                )
              }
            ]
          }}
        >
          {/* Drag handle and header with pan gesture */}
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View>
              {/* <Text>{screenDims.height}:{containerHeight}:{screenHeight}</Text> */}
              {/* Drag handle */}
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>
              
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </PanGestureHandler>
          
          {/* Content area - no pan gesture */}
          <View style={styles.contentContainer}>
            {children}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Portal>
  );
});

const styles = StyleSheet.create({
  dragHandleContainer: {
    width: '100%',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.dark20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark10,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark100,
  },
  closeButton: {
    fontSize: 16,
    color: colors.dark70,
  },
  contentContainer: {
    flex: 1,
  }
});

export default BottomSheet;
