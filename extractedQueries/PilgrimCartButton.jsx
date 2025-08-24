import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { colors, FONT_FAMILY, typography } from './theme';

function PilgrimCartButton({
  buttonText,
  loadingText = "Adding...",
  onPress,
  style,
  textStyle,
  containerStyle,
  disabled = false,
  isAvailable = true,
  variant = "regular"
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
    }).start(({ finished }) => {
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

    if (disabled || !isAvailable) {
      return;
    }

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

  // Determine which button style to render based on loading state
  const renderButtonContent = () => {
    if (isLoading) {
      // Loading state with white background and centered "Adding..." text
      return (
        <View style={styles.loadingButton}>
          <Text
            style={[
              typography.heading14,
              styles.loadingText,
              (variant === "large") && styles.buttonLargeText,
              textStyle
            ]}
          >
            {loadingText}
          </Text>
          {/* Progress bar overlay */}
          <Animated.View
            style={[
              styles.loadingProgressBar,
              { width: progressWidth }
            ]}
          />

          {/* Activity indicator in top right corner - only shown after animation completes */}
          {showActivityIndicator && (
            <View style={styles.activityIndicatorContainer}>
              <ActivityIndicator size="small" color={colors.secondaryMain} />
            </View>
          )}
        </View>
      );
    }

    if (!isAvailable) {
      // Out of stock state
      return (
        <View style={styles.outOfStockButton}>
          <Text
            style={[
              typography.heading14,
              styles.outOfStockText,
              (variant === "large") && styles.buttonLargeText,
              textStyle
            ]}
          >
            Coming Soon
          </Text>
        </View>
      );
    }

    // Normal button state
    return (
      <Text
        style={[
          typography.heading14,
          styles.buttonText,
          (variant === "large") && styles.buttonLargeText,
          textStyle
        ]}
      >
        {buttonText}
      </Text>
    );
  };

  return (
    <View style={[
      styles.container,
      containerStyle,
    ]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          (variant === "large") && styles.buttonLarge,
          style,
          pressed && !isLoading && isAvailable && styles.buttonPressed,
          isLoading && styles.buttonLoading,
          (disabled && styles.buttonDisabled)
        ]}>
        {renderButtonContent()}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  button: {
    height: 40,
    backgroundColor: colors.buttonBg,
    color: colors.dark100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Important for the progress bar to be contained
    position: 'relative', // For positioning the activity indicator
  },
  buttonLarge: {
    height: 48
  },
  buttonPressed: {
    // Inset shadow effect when pressed
    backgroundColor: '#af8f0f',
    transform: [{ scale: 0.98 }], // Slight scale down for pressed effect
  },
  buttonLoading: {
    backgroundColor: 'white', // No background when in loading state
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    zIndex: 2, // Ensure text is above the progress bar
  },
  buttonLargeText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: colors.dark100,
  },
  loadingButton: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 6,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loadingText: {
    color: colors.dark80,
    zIndex: 2, // Ensure text is above the progress bar
  },
  loadingProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.3)', // Semi-transparent gold color matching the button
    zIndex: 1,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: 2,
    right: 5,
    zIndex: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.dark20
  },
  outOfStockButton: {
    position: 'relative',
    backgroundColor: colors.dark20,
    borderRadius: 6,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  outOfStockText: {
    color: colors.dark80,
    zIndex: 2, // Ensure text is above the progress bar
  },
});

export default PilgrimCartButton;