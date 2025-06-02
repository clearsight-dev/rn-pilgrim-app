import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, FONT_FAMILY } from "../../../../extractedQueries/theme";


/**
 * Countdown Timer Component Configuration
 * ---------------------------------------
 * Type: "countdown-timer"
 *
 * Description:
 * Displays a countdown timer with a custom end date and styled layout.
 *
 * Configuration:
 * - endDate (Date): The target end date/time for the countdown.
 * - content (string): A custom label to display before the timer.
 * - styles (object): Style customization for the wrapper, container, label, and timer.
 *
 * Style Details:
 * - wrapper:
 *   - alignItems (string): Vertical alignment of items inside the wrapper.
 *   - justifyContent (string): Horizontal alignment of items inside the wrapper.
 *
 * - container:
 *   - backgroundColor (string): Background color of the timer container.
 *   - borderWidth (number): Border width of the container.
 *   - borderRadius (number): Border radius of the container.
 *   - alignItems (string): Vertical alignment inside container.
 *   - justifyContent (string): Horizontal alignment inside container.
 *   - marginLeft (number): Left margin of the timer.
 *
 * - label:
 *   - color (string): Text color for the label.
 *   - paddingVertical (number): Vertical padding for the label.
 *   - paddingHorizontal (number): Horizontal padding for the label.
 *
 * - timer:
 *   - color (string): Text color for the timer countdown.
 *
 * Example Usage:
 */

const countdownTimerConfigSample = {
  type: "countdown-timer",
  data: [{}],
  config: {
    endDate: new Date('2025-05-24T21:00:00'), // Countdown target end date/time
    content: "FEW OFFERS ENDING IN:", // Pre-timer text
    styles: {
      wrapper: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
      },
      container: {
        backgroundColor: "transparent",
        borderWidth: 0,
        borderRadius: 0,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginLeft: 16,
      },
      label: {
        color: "#00909E",
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
      timer: {
        color: "#00909E",
      },
    },
  },
};



interface CountdownTimerProps {
  loading: boolean;
  config: {
    content?: string;
    endDate?: string | Date;
    styles?: {
      container?: ViewStyle;
      label?: TextStyle;
      timer?: TextStyle;
      wrapper?: ViewStyle;
    };
  };
}

interface TimeLeft {
  hours: string;
  minutes: string;
  seconds: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ config, loading }) => {
  const endDate = config.endDate ? new Date(config.endDate) : new Date();

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = endDate.getTime() - now;

    if (difference <= 0) {
      return {
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }

    const hours = String(Math.floor(difference / (1000 * 60 * 60))).padStart(2, "0");
    const minutes = String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, "0");
    const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");

    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (loading) return null;

  const mergedContainerStyle = [styles.container, config?.styles?.container];
  const mergedLabelStyle = [styles.label, config?.styles?.label];
  const mergedTimerStyle = [styles.timer, config?.styles?.timer];
  const mergedWrapperStyle = [styles.wrapper, config?.styles?.wrapper];

  return (
    <View style={mergedWrapperStyle}>
      <View style={mergedContainerStyle}>
        <Text style={mergedLabelStyle}>
          {config.content || "Exclusive access ends in"}{" "}
          <Text style={mergedTimerStyle}>
            {timeLeft.hours}H:{timeLeft.minutes}M:{timeLeft.seconds}S
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: colors.primaryMain,
    borderRadius: 24,
    borderColor: colors.primaryDark,
    minWidth: 280,
    borderWidth: 2
  },
  label: {
    fontSize: 12,
    fontFamily: FONT_FAMILY?.medium,
    textTransform: "uppercase",
    lineHeight: 16 * 1.25,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timer: {
    fontFamily: FONT_FAMILY?.bold,
    color: "#fff",
  },
});

export default CountdownTimer;
