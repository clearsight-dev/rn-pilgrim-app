import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
    backgroundColor: '#00909E',
    borderWidth: 1.82,
    borderColor: '#00909E',
  },
  checkboxUnselected: {
    backgroundColor: '#F3F3F3',
    borderWidth: 1.82,
    borderColor: '#D1D1D1',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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

export default Checkbox;
