import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const RadioButton = forwardRef(({ 
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

  const radioElement = selected ? (
    <View style={styles.radioSelected}>
      <View style={styles.radioInner} />
    </View>
  ) : (
    <View style={styles.radioUnselected} />
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
          {radioElement}
          {labelElement}
        </>
      ) : (
        <>
          {labelElement}
          <View style={styles.spacer} />
          {radioElement}
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
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00909E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00909E',
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(179, 179, 179, 0.5)',
    backgroundColor: 'rgba(184, 184, 184, 0.3)',
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  labelLeft: {
    marginLeft: 0,
    marginRight: 8,
  },
  labelDisabled: {
    color: '#999',
  },
  spacer: {
    flex: 1,
  }
});

export default RadioButton;
