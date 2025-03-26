import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, Icon } from 'apptile-core';
import BottomSheet from '../../../../extractedQueries/BottomSheet';
import RadioButton from '../../../../extractedQueries/RadioButton';
import Checkbox from '../../../../extractedQueries/Checkbox';
import { fetchFilteredProductsCount } from '../../../../extractedQueries/collectionqueries';

const Footer = React.forwardRef(({
  sortOptions, 
  handleSortOptionSelect, 
  sortOption, 
  sortReverse,
  filterData,
  selectedFilters,
  applyFilters,
  totalProductsCount,
  isMaxTotalCount
}, ref) => {
  const [editableCopyOfSelectedFilters, setEditableCopyOfSelectedFilters] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState(0);
  const maxFilteredCount = 90;
  const [filteredProductsCount, setFilteredProductsCount] = useState({
    state: 'uninitialized', // loading, loaded
    value: 0
  });
  const [isLoadingFilteredCount, setIsLoadingFilteredCount] = useState(false);
  const [isMaxFilteredCount, setIsMaxFilteredCount] = useState(false);
  
  const filterBottomSheetRef = useRef(null);
  const sortBottomSheetRef = useRef(null);
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));

  // Function to convert selected filters to Shopify filter format
  const getShopifyFilters = (filters) => {
    return filters.map(filter => {
      // Check if this is a metafield filter (contains 'p.m' in the ID)
      if (filter.id.includes('p.m')) {
        // Split the ID by dots
        const parts = filter.id.split('.');
        
        // For metafield filters, the format is typically:
        // filter.p.m.[namespace].[key].[value-identifier]
        // We need to extract the namespace and key
        if (parts.length >= 4) {
          const namespace = parts[parts.length - 2];
          const key = parts[parts.length - 1];
          
          // For metafield filters, we need to use the label as the value
          // and create a filter for each selected value
          return filter.values.map(valueId => {
            // Find the corresponding filter value object to get the label
            const filterDataItem = filterData.find(f => f.id === filter.id);
            const valueObj = filterDataItem?.values?.find(v => v.id === valueId);
            
            return {
              productMetafield: {
                namespace,
                key,
                value: valueObj?.label || valueId
              }
            };
          });
        }
      }
      
      // Default case: use the standard product filter format
      return {
        productFilter: {
          filterType: filter.id,
          values: filter.values
        }
      };
    }).flat(); // Flatten the array since metafield filters might return arrays
  };

  // Function to fetch filtered products count
  const fetchFilteredCount = async (filters) => {
    if (!shopifyDSModel || filters.length === 0) {
      setFilteredProductsCount({
        state: 'loaded',
        value: 0
      });
      setIsMaxFilteredCount(false);
      return;
    }
    
    setIsLoadingFilteredCount(true);
    setFilteredProductsCount({
      state: 'loading',
      value: 0
    });
    
    try {
      const queryRunner = shopifyDSModel.get('queryRunner');
      const shopifyFilters = getShopifyFilters(filters);
      
      const result = await fetchFilteredProductsCount(queryRunner, "hair-care", shopifyFilters);
      
      setFilteredProductsCount({
        state: 'loaded',
        value: result.count
      });
      setIsMaxFilteredCount(result.count >= maxFilteredCount);
    } catch (error) {
      console.error('Error fetching filtered products count:', error);
      setFilteredProductsCount({
        state: 'error',
        value: 0
      });
    } finally {
      setIsLoadingFilteredCount(false);
    }
  };

  // Function to handle filter selection
  const handleFilterSelect = (filterId, valueId) => {
    setEditableCopyOfSelectedFilters(prev => {
      // Check if this filter is already selected
      const existingFilterIndex = prev.findIndex(f => f.id === filterId);
      
      let newFilters;
      if (existingFilterIndex >= 0) {
        // Filter exists, check if value is already selected
        const existingFilter = prev[existingFilterIndex];
        const valueIndex = existingFilter.values.indexOf(valueId);
        
        if (valueIndex >= 0) {
          // Value exists, remove it
          const newValues = [...existingFilter.values];
          newValues.splice(valueIndex, 1);
          
          // If no values left, remove the filter
          if (newValues.length === 0) {
            newFilters = [...prev];
            newFilters.splice(existingFilterIndex, 1);
          } else {
            // Update the filter with new values
            newFilters = [...prev];
            newFilters[existingFilterIndex] = {
              ...existingFilter,
              values: newValues
            };
          }
        } else {
          // Value doesn't exist, add it
          newFilters = [...prev];
          newFilters[existingFilterIndex] = {
            ...existingFilter,
            values: [...existingFilter.values, valueId]
          };
        }
      } else {
        // Filter doesn't exist, add it with the value
        newFilters = [...prev, { id: filterId, values: [valueId] }];
      }
      
      // Update the filtered count
      fetchFilteredCount(newFilters);
      
      return newFilters;
    });
  };

  // Function to check if a filter value is selected
  const isFilterValueSelected = (filterId, valueId) => {
    const filter = editableCopyOfSelectedFilters.find(f => f.id === filterId);
    return filter ? filter.values.includes(valueId) : false;
  };

  // Function to open filter bottom sheet
  const openFilterBottomSheet = () => {
    // We get a copy of the selectedFilters and edit those 
    // in the bottomsheet. Once the applyFilter is clicked we close the 
    // bottomsheet so this copy is unused after that point.
    setEditableCopyOfSelectedFilters([...selectedFilters]);
    setActiveFilterTab(0);
    
    // Reset the filtered count
    setFilteredProductsCount({
      state: 'uninitialized',
      value: 0
    });
    
    // If there are filters, fetch the count
    if (selectedFilters.length > 0) {
      fetchFilteredCount(selectedFilters);
    }
    
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

  // Render sort option item with RadioButton
  const renderSortOption = (option, index) => {
    const isSelected = sortOption === option.value && sortReverse === option.reverse;
    
    return (
      <View key={`sort-option-${index}`} style={styles.sortOptionItem}>
        <RadioButton
          label={option.label}
          initialValue={isSelected}
          onChange={(prevValue, newValue) => {
            if (newValue) {
              handleSortOptionSelect(option);
            }
          }}
          style={styles.sortRadioButton}
          labelStyle={[styles.sortOptionText, isSelected && styles.selectedSortOptionText]}
          controlsPosition="right"
        />
      </View>
    );
  };

  // Render filter value item with Checkbox
  const renderFilterValueWithCheckbox = (filter, value) => {
    const isSelected = isFilterValueSelected(filter.id, value.id);
    
    return (
      <View key={`filter-value-${value.id}`} style={styles.filterValueItem}>
        <Checkbox
          label={value.label}
          initialValue={isSelected}
          onChange={(prevValue, newValue) => {
            handleFilterSelect(filter.id, value.id);
          }}
          style={styles.filterCheckbox}
          labelStyle={[styles.filterValueText, isSelected && styles.selectedFilterValueText]}
          controlsPosition="right"
        />
      </View>
    );
  };

  // Function to handle apply filters
  const handleApplyFilters = () => {
    applyFilters(editableCopyOfSelectedFilters);
  };

  const currentSortLabel = sortOptions.find(it => it.value === sortOption && it.reverse === sortReverse)
  let numFiltersText = 'No Filter Applied';
  const flattenedFilters = selectedFilters.flatMap(it => it.values);
  console.log('filters: ', flattenedFilters);
  if (flattenedFilters?.length === 1) {
    numFiltersText = '1 Filter Applied';
  } else if (flattenedFilters?.length > 1) {
    numFiltersText = `${flattenedFilters.length} Filters Applied`;
  }

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
          <View style={{flexDirection: 'column'}}>
            <Text style={styles.buttonText}>Sort By</Text>
            {currentSortLabel && <Text style={styles.buttonSubtext}>{currentSortLabel.label}</Text>}
          </View>
        </TouchableOpacity>

        <View style={styles.bottomButtonsSeparator}></View>
        
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={openFilterBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'filter-outline'} 
            style={styles.buttonIcon}
          />
          <View style={{flexDirection: 'column'}}>
            <Text style={styles.buttonText}>Filter</Text>
            <Text style={styles.buttonSubtext}>{numFiltersText}</Text>
          </View>
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
                  renderItem={({ item }) => renderFilterValueWithCheckbox(filterData[activeFilterTab], item)}
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
                  {editableCopyOfSelectedFilters.length > 0 && filteredProductsCount.state === 'loaded' ? (
                    isMaxFilteredCount ? 
                    `${maxFilteredCount}+ Products` : 
                    `${filteredProductsCount.value} Products`
                  ) : (
                    isMaxTotalCount ? 
                    `${maxFilteredCount}+ Products` : 
                    `${totalProductsCount} Products`
                  )}
                </Text>
              )}
            </View>
            
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>
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
  sortRadioButton: {
    width: '100%',
  },
  filterCheckbox: {
    width: '100%',
  },
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
    paddingHorizontal: 16,
  },
  bottomButtonsSeparator: {
    height: '100%',
    width: 1,
    backgroundColor: '#00000010'
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    marginHorizontal: 8,
  },
  buttonIcon: {
    marginRight: 8,
    fontSize: 20,
    fontWeight: '300',
    color: '#1A1A1A',
  },
  buttonSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#646464'
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
