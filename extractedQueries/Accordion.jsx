import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
} from 'react-native';
import {Icon} from 'apptile-core';

export function Accordion({ title, children, initiallyExpanded = true }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.titleContainer} 
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <Text style={styles.titleText}>{title}</Text>
        {
          expanded ? 
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-up'} 
              style={{
                marginRight: 8,
                fontSize: 20,
                color: '#1A1A1A'
              }}
            />):
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-down'} 
              style={{
                marginRight: 8,
                fontSize: 20,
                color: '#1A1A1A'
              }}
            />)
        }
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.contentContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  }
});

export default Accordion;
