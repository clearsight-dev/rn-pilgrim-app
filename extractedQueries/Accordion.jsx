import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
} from 'react-native';
import {Icon} from 'apptile-core';
import { colors } from './theme';

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
                color: colors.dark100
              }}
            />):
            (<Icon 
              iconType={'Material Icon'} 
              name={'chevron-down'} 
              style={{
                marginRight: 8,
                fontSize: 20,
                color: colors.dark100
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
    color: colors.dark100
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: colors.white,
  }
});

export default Accordion;
