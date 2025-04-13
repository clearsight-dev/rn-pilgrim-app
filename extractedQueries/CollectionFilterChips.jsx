import React from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView
} from 'react-native';
import { Icon } from 'apptile-core';
import { colors } from './theme';

/**
 * 
 * @param {filterData} param0 Array<{id: string, label: "Display text", value: "object that goes in the filters array"}>
 * @param {selectedFilters} param1 string[], array of filter ids
 * @returns 
 */
function CollectionFilterChips ({ 
  filterData, 
  appliedFilters, 
  onFilterRemove,
  onFilterSelect,
  onClearAllFilters
}) {
  const selectedOptions = [];
  const unselectedOptions = [];
  for (let i = 0; i < filterData.length; ++i) {
    if (appliedFilters.indexOf(filterData[i].id) >= 0) {
      selectedOptions.push(filterData[i]);
    } else {
      unselectedOptions.push(filterData[i]);
    }
  }
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All" chip that shows when no filters are selected */}
        <Pressable 
          style={({pressed}) => [
            styles.chip, 
            (appliedFilters.length === 0) && styles.selectedChip,
            pressed && {opacity: 0.5}
          ]}
          onPress={onClearAllFilters}
        >
          <Text style={[
            styles.chipText,
            (appliedFilters.length === 0) && colors.primaryDark,
          ]}>All</Text>
        </Pressable>
        
        {/* Selected filter chips (shown first) */}
        {selectedOptions.map(chip => (
          <Pressable 
            key={chip.id} 
            style={({pressed}) => [
              styles.chip, 
              styles.selectedChip,
              pressed && {opacity: 0.5}
            ]}
            onPress={() => onFilterRemove(chip.id)}
          >
            <Text style={[styles.chipText, styles.selectedChipText]}>{chip.label}</Text>
            <Icon 
              iconType={'Material Icon'} 
              name={'close'} 
              style={styles.closeIcon}
            />
          </Pressable>
        ))}
        
        {/* Unselected filter options */}
        {unselectedOptions.map(option => (
          <Pressable 
            key={option.id} 
            style={({pressed}) => [
              styles.chip,
              pressed && {opacity: 0.5}
            ]}
            onPress={() => onFilterSelect(option.id)}
          >
            <Text style={styles.chipText}>{option.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.dark20,
  },
  selectedChip: {
    borderColor: colors.primaryDark,
    backgroundColor: 'rgba(0, 144, 158, 0.04)', // 4% opacity
  },
  chipText: {
    fontSize: 14,
    color: colors.dark100,
  },
  selectedChipText: {
    color: colors.primaryDark,
  },
  closeIcon: {
    fontSize: 16,
    color: colors.primaryDark,
    marginLeft: 8,
  },
});

export default CollectionFilterChips;
