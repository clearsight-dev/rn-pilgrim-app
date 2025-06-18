import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, FONT_FAMILY } from './theme';

const Checkbox = forwardRef(({ 
  label, 
  initialValue = false, 
  onChange,
  style,
  labelStyle,
  disabled = false,
  controlsPosition = 'left' // 'left' or 'right'
}, ref) => {
  const [selected, setSelected] = useState(initialValue);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    isSelected: () => selected,
    setSelected: (value) => {
      const prevValue = selected;
      setSelected(value);
      if (onChange) {
        onChange(prevValue, value);
      }
    },
    toggle: () => {
      const prevValue = selected;
      const newValue = !prevValue;
      setSelected(newValue);
      if (onChange) {
        onChange(prevValue, newValue);
      }
    }
  }));

  const handlePress = () => {
    if (disabled) return;
    
    const prevValue = selected;
    const newValue = !prevValue;
    setSelected(newValue);
    
    if (onChange) {
      onChange(prevValue, newValue);
    }
  };

  const checkboxElement = (
    <View style={[
      styles.checkbox,
      selected ? styles.checkboxSelected : styles.checkboxUnselected,
      disabled && styles.checkboxDisabled
    ]}>
      {selected && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </View>
  );

  const labelElement = label ? (
    <Text style={[
      styles.label, 
      labelStyle, 
      disabled && styles.labelDisabled,
      controlsPosition === 'right' && styles.labelLeft
    ]}>
      {label}
    </Text>
  ) : null;

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {controlsPosition === 'left' ? (
        <>
          {checkboxElement}
          {labelElement}
        </>
      ) : (
        <>
          {labelElement}
          <View style={styles.spacer} />
          {checkboxElement}
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    justifyContent: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6.36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primaryDark,
    borderWidth: 1.82,
    borderColor: colors.primaryDark,
  },
  checkboxUnselected: {
    backgroundColor: colors.dark10,
    borderWidth: 1.82,
    borderColor: colors.dark20,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    fontFamily: FONT_FAMILY.bold,
    color: 'white',
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '600',
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.dark90,
    flex: 1,
  },
  labelLeft: {
    marginLeft: 0,
    marginRight: 8,
  },
  labelDisabled: {
    color: colors.dark50,
  },
  spacer: {
    flex: 1,
    maxWidth: 10,
  }
});

export default Checkbox;
