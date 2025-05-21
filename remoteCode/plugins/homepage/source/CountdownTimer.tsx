import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, FONT_FAMILY } from "../../../../extractedQueries/theme";

interface CountdownTimerProps {
  loading: boolean;
  config: {
    content?: string;
    endDate?: string | Date;
    style?: {
      container?: ViewStyle;
      label?: TextStyle;
      timer?: TextStyle; // Currently unused directly, could be split if you separate timer digits
    };
  };
}

interface TimeLeft {
  days: string;
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
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }

    const days = String(
      Math.floor(difference / (1000 * 60 * 60 * 24))
    ).padStart(2, "0");
    const hours = String(
      Math.floor((difference / (1000 * 60 * 60)) % 24)
    ).padStart(2, "0");
    const minutes = String(Math.floor((difference / 1000 / 60) % 60)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor((difference / 1000) % 60)).padStart(
      2,
      "0"
    );

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (loading) return null;

  const mergedContainerStyle = [styles.container, config?.style?.container];

  const mergedLabelStyle = [styles.label, config?.style?.label];

  return (
    <View style={styles.wrapper}>
      <View style={mergedContainerStyle}>
        <Text style={mergedLabelStyle}>
          {config.content || "Exclusive access ends in"} {timeLeft.days}D:
          {timeLeft.hours}H:{timeLeft.minutes}M:{timeLeft.seconds}S
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
    minWidth: 280,
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
});

export default CountdownTimer;
