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

/**
 * 
 * @param {filterData} param0 Array<{id: string, label: "Display text", value: "object that goes in the filters array"}>
 * @param {selectedFilters} param1 string[], array of filter ids
 * @returns 
 */
function ChipCarouselFilters ({ 
  filterData, 
  selectedFilters, 
  onFilterRemove,
  onFilterSelect,
  onClearAllFilters
}) {
  const selectedOptions = [];
  const unselectedOptions = [];
  for (let i = 0; i < filterData.length; ++i) {
    if (selectedFilters.indexOf(filterData[i].id) >= 0) {
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
            (selectedFilters.length === 0) && styles.selectedChip,
            pressed && {opacity: 0.5}
          ]}
          onPress={onClearAllFilters}
        >
          <Text style={styles.chipText}>All</Text>
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
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  selectedChip: {
    borderColor: '#00909E',
    backgroundColor: 'rgba(0, 144, 158, 0.04)', // 4% opacity
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedChipText: {
    color: '#00909E',
  },
  closeIcon: {
    fontSize: 16,
    color: '#00909E',
    marginLeft: 8,
  },
});

export default ChipCarouselFilters;
