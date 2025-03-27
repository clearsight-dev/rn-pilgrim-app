import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'apptile-core';
import GradientBackground from '../../../../extractedQueries/GradientBackground';

// Separate UI component that takes props
export default function BenefitsCard({ title = "", benefits = [], style = {} }) {
  // Title to display
  const titleText = title;
  
  // Estimated title width for the cutout (this is an approximation)
  const estimatedTitleWidth = titleText.length * 10 + 20; // 10px per character + 20px padding

  // Custom gradient colors for the benefits card
  const gradientColors = [
    { offset: "0%", color: "rgba(255, 255, 255, 1)", opacity: 0.5 },
    { offset: "80%", color: "rgba(55, 238, 255, 1)", opacity: 0.2 },
    { offset: "100%", color: "rgba(55, 238, 255, 1)", opacity: 0.2 }
  ];

  return (
    <View style={[styles.outerContainer, style]}>
      {/* Main container with border */}
      <GradientBackground 
        style={styles.container}
        gradientColors={gradientColors}
        gradientDirection="vertical"
        borderRadius={BORDER_RADIUS}
      >

        {/* Title cutout (white background to hide the border) */}
        <View style={[styles.titleCutout, { width: estimatedTitleWidth }]} />
        
        {/* Title container with the same width as the cutout */}
        <View style={[styles.titleContainer, { width: estimatedTitleWidth }]}>
          <Text style={styles.title}>{titleText}</Text>
        </View>
        
        {/* Content container */}
        <View style={styles.contentContainer}>
          {/* Benefits list */}
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Icon 
                iconType={'Ionicons'} 
                name={'sparkles-sharp'} 
                style={{
                  marginRight: 8,
                  fontSize: 20,
                  color: BORDER_COLOR
                }}
              />
              <Text style={styles.benefitText}>{benefit.trim()}</Text>
            </View>
          ))}
        </View>
      </GradientBackground>
    </View>
  );
};

const BORDER_COLOR = '#00909E';
const BORDER_WIDTH = 1;
const BORDER_RADIUS = 8;

const styles = StyleSheet.create({
  outerContainer: {
    padding: 16,
    width: '100%',
  },
  container: {
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRadius: BORDER_RADIUS,
    position: 'relative',
  },
  titleCutout: {
    position: 'absolute',
    height: BORDER_WIDTH,
    backgroundColor: 'white',
    top: -BORDER_WIDTH,
    left: 16, // Align with left padding
  },
  titleContainer: {
    position: 'absolute',
    top: -15, // Position to overlap the border
    left: 16, // Align with left padding
    alignItems: 'center', // Center the text horizontally
    backgroundColor: 'transparent',
  },
  title: {
    color: BORDER_COLOR,
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: -0.08, // -0.4% of 20px
    paddingHorizontal: 4,
  },
  contentContainer: {
    marginTop: 20, // Space from title to content
    padding: 16
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    color: BORDER_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    flex: 1,
    lineHeight: 20,
  },
});
