import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import {StarSvg} from './Star';
import GradientText from '../../../../../extractedQueries/GradientText';

const AccordionItem = ({open, onPress, title, description, idx}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // Measure only once and ignore if already measured
  const [measured, setMeasured] = useState(false);

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: open ? contentHeight : 0,
      duration: 260,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [open, contentHeight]);

  return (
    <View style={styles.card}>
      {/* BUTTON */}
      <TouchableOpacity
        style={[styles.cardBtn, open && styles.cardBtnOpen]}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{expanded: open}}>
        <View
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <StarSvg />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.chevron}>{open ? '–' : '+'}</Text>
      </TouchableOpacity>

      {/* HIDDEN MEASUREMENT VIEW */}
      {!measured && (
        <View
          style={styles.hiddenContent}
          pointerEvents="none"
          onLayout={e => {
            setContentHeight(e.nativeEvent.layout.height);
            setMeasured(true);
          }}>
          <View style={styles.collapseContent}>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>
        </View>
      )}

      {/* ANIMATED VISIBLE CONTENT */}
      <Animated.View
        style={[
          styles.collapse,
          {height: animatedHeight, opacity: open ? 1 : 0.5},
        ]}>
        <View style={styles.collapseContent}>
          {/* Only show if measured, else don't render to avoid duplicate */}
          {measured && <Text style={styles.cardDesc}>{description}</Text>}
        </View>
      </Animated.View>
    </View>
  );
};

export const LoveItComponent = ({cardTitle, benefits, backgroundColor}) => {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <View style={{...styles.bg, backgroundColor}}>
      <GradientText
        style={styles.heading}
        text={cardTitle}
        fontSize={24}
        fontWeight="bold"
        width="100%"
        height={60}
        y="40"
      />
      <View style={{marginTop: 8, width: '100%'}}>
        {benefits.map((benefit, idx) => (
          <AccordionItem
            key={idx}
            open={openIndex === idx}
            onPress={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            title={benefit.title}
            description={benefit.description}
            idx={idx}
          />
        ))}
      </View>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  bg: {
    width: '100%',
    flex: 1,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  heading: {
    fontWeight: '700',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 15,
    marginHorizontal: 34,
    marginBottom: 14,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    cursor: 'pointer',
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 20,
    backgroundColor: 'transparent',
    borderRadius: 18,
  },
  cardBtnOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  icon: {
    position: 'absolute',
    left: 20,
    fontSize: 24,
    color: '#1193A3',
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    color: '#313131',
  },
  chevron: {
    fontSize: 18,
    color: '#313131',
  },
  collapse: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingBottom: 0,
  },
  hiddenContent: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    left: 0,
    right: 0,
  },
  collapseContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  cardDesc: {
    color: '#313131',
    lineHeight: 20,
  },
});

export default LoveItComponent;
