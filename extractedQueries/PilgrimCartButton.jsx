import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';

function PilgrimCartButton({
  buttonText,
  onPress,
  style,
  textStyle,
  containerStyle,
}) {
  // State to track if we're in loading state
  const [isLoading, setIsLoading] = useState(false);
  // State to track if we should show the activity indicator (after progress animation completes)
  const [showActivityIndicator, setShowActivityIndicator] = useState(false);
  // Animation value for progress bar width
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Reference to store the promise
  const promiseRef = useRef(null);
  // Timer reference
  const timerRef = useRef(null);
  // Track if promise has resolved but animation is still running
  const promiseResolvedRef = useRef(false);
  // Track if animation is running
  const animationRunningRef = useRef(false);

  // Function to start the progress animation
  const startProgressAnimation = () => {
    // Reset states
    setShowActivityIndicator(false);
    progressAnim.setValue(0);
    promiseResolvedRef.current = false;
    animationRunningRef.current = true;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Start the progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds
      useNativeDriver: false,
    }).start(({finished}) => {
      animationRunningRef.current = false;
      
      // If animation finished
      if (finished) {
        // If promise has already resolved, reset loading state
        if (promiseResolvedRef.current) {
          setIsLoading(false);
          setShowActivityIndicator(false);
        } 
        // If still loading, show activity indicator
        else if (isLoading) {
          setShowActivityIndicator(true);
        }
      }
    });
    
    // Set a timer to switch to activity indicator after 1.5 seconds
    timerRef.current = setTimeout(() => {
      // Only show activity indicator if promise hasn't resolved yet
      if (isLoading && !promiseResolvedRef.current) {
        setShowActivityIndicator(true);
      }
    }, 1500);
  };

  const handlePress = async (e) => {
    e.stopPropagation();
    
    // If already loading, just restart the animation but don't call onPress again
    if (isLoading) {
      startProgressAnimation();
      return;
    }
    
    try {
      const result = onPress(e);
      
      // Check if the callback returns a promise
      if (result && typeof result.then === 'function') {
        // Store the promise reference
        promiseRef.current = result;
        
        // Set loading state
        setIsLoading(true);
        
        // Start the progress animation
        startProgressAnimation();
        
        // Wait for the promise to resolve
        await result;
        
        // Mark that the promise has resolved
        promiseResolvedRef.current = true;
        
        // If animation has already completed, reset loading state
        if (!animationRunningRef.current) {
          setIsLoading(false);
          setShowActivityIndicator(false);
        }
        
        // Clear the timer to prevent activity indicator from showing
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error in PilgrimCartButton:', error);
      
      // Mark that the promise has resolved (with error)
      promiseResolvedRef.current = true;
      
      // If animation has already completed, reset loading state
      if (!animationRunningRef.current) {
        setIsLoading(false);
        setShowActivityIndicator(false);
      }
      
      // Clear the timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Calculate the width of the progress bar based on the animation value
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          style,
          pressed && !isLoading && styles.buttonPressed
        ]}>
        {/* Progress bar overlay */}
        {isLoading && !showActivityIndicator && (
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressWidth }
            ]}
          />
        )}
        
        {/* Button text */}
        <Text 
          style={[
            styles.buttonText, 
            textStyle
          ]}
        >
          {buttonText}
        </Text>
        
        {/* Activity indicator in top right corner */}
        {isLoading && showActivityIndicator && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator size="small" color="#333333" />
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  button: {
    height: 33,
    backgroundColor: '#FACA0C',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Important for the progress bar to be contained
    position: 'relative', // For positioning the activity indicator
  },
  buttonPressed: {
    // Inset shadow effect when pressed
    backgroundColor: '#af8f0f',
    transform: [{ scale: 0.98 }], // Slight scale down for pressed effect
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    zIndex: 2, // Ensure text is above the progress bar
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent overlay
    zIndex: 1,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: 2,
    right: 5,
    zIndex: 3,
  },
});

export default PilgrimCartButton;
