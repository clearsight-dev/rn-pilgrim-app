import React, { useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Icon } from 'apptile-core';
import BottomSheet from '../../../../extractedQueries/BottomSheet';

const Footer = React.forwardRef(({ 
  sortOptions, 
  handleSortOptionSelect, 
  sortOption, 
  sortReverse,
  filterData,
  activeFilterTab,
  setActiveFilterTab,
  renderFilterValue,
  isLoadingFilteredCount,
  selectedFilters,
  filteredProductsCount,
  isMaxFilteredCount,
  clearAllFilters,
  applyFilters
}, ref) => {
  const filterBottomSheetRef = useRef(null);
  const sortBottomSheetRef = useRef(null);

  // Function to open filter bottom sheet
  const openFilterBottomSheet = () => {
    if (filterBottomSheetRef.current) {
      filterBottomSheetRef.current.show();
    }
  };
  
  // Function to open sort bottom sheet
  const openSortBottomSheet = () => {
    if (sortBottomSheetRef.current) {
      sortBottomSheetRef.current.show();
    }
  };

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    hideSortBottomSheet: () => {
      if (sortBottomSheetRef.current) {
        sortBottomSheetRef.current.hide();
      }
    },
    hideFilterBottomSheet: () => {
      if (filterBottomSheetRef.current) {
        filterBottomSheetRef.current.hide();
      }
    }
  }));

  // Render filter category tab
  const renderFilterTab = (filter, index) => {
    const isActive = activeFilterTab === index;
    
    return (
      <TouchableOpacity
        key={`filter-tab-${index}`}
        style={[styles.filterTab, isActive && styles.activeFilterTab]}
        onPress={() => setActiveFilterTab(index)}
      >
        <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render sort option item
  const renderSortOption = (option, index) => {
    const isSelected = sortOption === option.value && sortReverse === option.reverse;
    
    return (
      <TouchableOpacity
        key={`sort-option-${index}`}
        style={[styles.sortOptionItem, isSelected && styles.selectedSortOption]}
        onPress={() => handleSortOptionSelect(option)}
      >
        <Text style={[styles.sortOptionText, isSelected && styles.selectedSortOptionText]}>
          {option.label}
        </Text>
        {isSelected && (
          <Icon 
            iconType={'Material Icon'} 
            name={'check'} 
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Bottom buttons for sort and filter */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={openSortBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'sort'} 
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Sort</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={openFilterBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'filter-outline'} 
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom sheets */}
      <BottomSheet 
        ref={filterBottomSheetRef}
        title="Filter"
        sheetHeight={0.7}
      >
        <View style={styles.filterBottomSheetContent}>
          <View style={styles.filterOptions}>
            {/* Filter tabs */}
            <View style={styles.filterTabsContainer}>
              <ScrollView>
                {filterData.map(renderFilterTab)}
              </ScrollView>
            </View>
            
            {/* Filter values */}
            <View style={styles.filterValuesContainer}>
              {filterData.length > 0 && activeFilterTab < filterData.length && (
                <FlatList
                  data={filterData[activeFilterTab].values}
                  renderItem={({ item }) => renderFilterValue(filterData[activeFilterTab], item)}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
          
          {/* Bottom action bar */}
          <View style={styles.filterActionBar}>
            <View style={styles.filterCountContainer}>
              {isLoadingFilteredCount ? (
                <ActivityIndicator size="small" color="#007bff" />
              ) : (
                <Text style={styles.filterCountText}>
                  {selectedFilters.length > 0 ? (
                    isMaxFilteredCount ? 
                    '90+ Products' : 
                    `${filteredProductsCount} Products`
                  ) : ''}
                </Text>
              )}
            </View>
            
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearAllFilters}
                disabled={selectedFilters.length === 0}
              >
                <Text style={[
                  styles.clearButtonText, 
                  selectedFilters.length === 0 && styles.disabledButtonText
                ]}>
                  Clear All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.applyButton,
                  selectedFilters.length === 0 && styles.disabledButton
                ]}
                onPress={applyFilters}
                disabled={selectedFilters.length === 0}
              >
                <Text style={[
                  styles.applyButtonText,
                  selectedFilters.length === 0 && styles.disabledButtonText
                ]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BottomSheet>
      
      <BottomSheet 
        ref={sortBottomSheetRef}
        title="Sort By"
        sheetHeight={0.5}
      >
        <View style={styles.bottomSheetContent}>
          {sortOptions.map(renderSortOption)}
        </View>
      </BottomSheet>
    </>
  );
});

const styles = StyleSheet.create({
  // Bottom buttons styles
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonIcon: {
    marginRight: 8,
    fontSize: 20,
    color: '#1A1A1A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  // Bottom sheet content styles
  bottomSheetContent: {
    padding: 16,
    flex: 1,
  },
  // Sort options styles
  sortOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedSortOption: {
    backgroundColor: '#f8f8f8',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSortOptionText: {
    fontWeight: '600',
    color: '#000',
  },
  checkIcon: {
    fontSize: 20,
    color: '#007bff',
  },
  // Filter bottom sheet styles
  filterBottomSheetContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  filterOptions: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  filterTabsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: '#F5F5F5',
    borderBottomColor: '#eee',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  activeFilterTab: {
    backgroundColor: 'white',
  },
  filterTabText: {
    fontSize: 14,
    color: '#0a0a0a',
    fontWeight: '300'
  },
  activeFilterTabText: {
    color: '#0a0a0a',
    fontWeight: '500',
  },
  filterValuesContainer: {
    flex: 1,
    padding: 16,
  },
  filterValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilterValue: {
    backgroundColor: '#f8f8f8',
  },
  filterValueText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterValueText: {
    fontWeight: '600',
    color: '#000',
  },
  filterActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterCountContainer: {
    flex: 1,
  },
  filterCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#888',
  },
});

export default Footer;
