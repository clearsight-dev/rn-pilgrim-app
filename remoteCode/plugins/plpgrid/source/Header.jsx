import React from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Icon } from 'apptile-core';

const Header = ({ 
  filterData, 
  selectedFilters, 
  onFilterRemove,
  onFilterSelect,
  onClearAllFilters
}) => {
  // Function to get the label for a filter value
  const getFilterValueLabel = (filterId, valueId) => {
    const filter = filterData.find(f => f.id === filterId);
    if (!filter) return '';
    
    const value = filter.values.find(v => v.id === valueId);
    return value ? value.label : '';
  };

  // Function to get all selected filter values as chips
  const getSelectedFilterChips = () => {
    const chips = [];
    
    selectedFilters.forEach(filter => {
      filter.values.forEach(valueId => {
        const filterLabel = getFilterValueLabel(filter.id, valueId);
        
        chips.push({
          id: `${filter.id}-${valueId}`,
          filterId: filter.id,
          valueId: valueId,
          label: filterLabel
        });
      });
    });
    
    return chips;
  };

  // Get filter options to show as chips (up to 10)
  const getFilterOptions = () => {
    if (!filterData || filterData.length === 0) return [];
    
    const filterOptions = [];
    const selectedFilterIds = new Set();
    
    // Create a set of selected filter IDs for quick lookup
    selectedFilters.forEach(filter => {
      filter.values.forEach(valueId => {
        selectedFilterIds.add(`${filter.id}-${valueId}`);
      });
    });
    
    // Find filters that belong to tabs with "subcategory" in their name
    const subcategoryFilters = filterData.filter(filter => 
      filter.label && filter.label.toLowerCase().includes('subcategory')
    );
    
    // If no subcategory filters found, return empty array
    if (subcategoryFilters.length === 0) {
      return [];
    }
    
    // Try to get options from subcategory filters, up to 10 total
    for (let i = 0; i < subcategoryFilters.length && filterOptions.length < 10; i++) {
      const filter = subcategoryFilters[i];
      
      // Skip price filters
      if (filter.id.includes('price') || filter.label?.toLowerCase().includes('price')) {
        continue;
      }
      
      // Only include LIST type filters
      if (filter.type !== 'LIST' && filter.values && filter.values.length > 0) {
        // For non-LIST filters, check if they have a type property
        let isListType = false;
        
        // If no explicit type, check if it has values array which is typical for LIST type
        if (filter.values && Array.isArray(filter.values)) {
          isListType = true;
        }
        
        if (!isListType) {
          continue;
        }
      }
      
      // Add all values from this subcategory filter (up to the 10 total limit)
      if (filter.values && filter.values.length > 0) {
        for (let j = 0; j < filter.values.length && filterOptions.length < 10; j++) {
          const value = filter.values[j];
          const chipId = `${filter.id}-${value.id}`;
          
          // Only add if not already selected
          if (!selectedFilterIds.has(chipId)) {
            filterOptions.push({
              id: `quick-${chipId}`,
              filterId: filter.id,
              valueId: value.id,
              label: value.label,
              isSelected: false
            });
          }
        }
      }
    }
    
    return filterOptions;
  };

  const selectedChips = getSelectedFilterChips();
  const showAllChip = selectedChips.length === 0;
  const filterOptions = getFilterOptions();

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All" chip that shows when no filters are selected */}
        {showAllChip ? (
          <TouchableOpacity 
            style={[styles.chip, styles.selectedChip]}
            onPress={onClearAllFilters}
          >
            <Text style={[styles.chipText, styles.selectedChipText]}>All</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.chip}
            onPress={onClearAllFilters}
          >
            <Text style={styles.chipText}>All</Text>
          </TouchableOpacity>
        )}
        
        {/* Selected filter chips (shown first) */}
        {selectedChips.map(chip => (
          <TouchableOpacity 
            key={chip.id} 
            style={[styles.chip, styles.selectedChip]}
            onPress={() => onFilterRemove(chip.filterId, chip.valueId)}
          >
            <Text style={[styles.chipText, styles.selectedChipText]}>{chip.label}</Text>
            <Icon 
              iconType={'Material Icon'} 
              name={'close'} 
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        ))}
        
        {/* Unselected filter options */}
        {filterOptions.map(option => (
          <TouchableOpacity 
            key={option.id} 
            style={styles.chip}
            onPress={() => onFilterSelect(option.filterId, option.valueId)}
          >
            <Text style={styles.chipText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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

export default Header;
