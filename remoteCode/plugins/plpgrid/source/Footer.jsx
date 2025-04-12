import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Icon } from 'apptile-core';
import BottomSheet from '../../../../extractedQueries/BottomSheet';
import RadioButton from '../../../../extractedQueries/RadioButton';
import Checkbox from '../../../../extractedQueries/Checkbox';
import { fetchFilteredProductsCount } from '../../../../extractedQueries/collectionqueries';
import { colors, typography } from '../../../../extractedQueries/theme';

export function getShopifyFilters(filterIds, filterData) {
  const filters = [];
  for (let i = 0; i < filterData.filters.length; ++i) {
    const filter = filterData.filters[i];
    if (filterIds.indexOf(filter.id) >= 0) {
      try {
        filters.push(JSON.parse(filter.input));
      } catch(err) {
        console.error("Failed to parse filter input");
      }
    }
  }
  return filters;
}

const Footer = React.forwardRef(({
  sortOptions, 
  handleSortOptionSelect, 
  sortOption, 
  sortReverse,
  filterData,
  applyFilters,
  totalProductsCount,
  isMaxTotalCount,
  collectionHandle,
  appliedFilters
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

  // Function to fetch filtered products count
  async function fetchFilteredCount(filters) {
    setIsLoadingFilteredCount(true);
    setFilteredProductsCount({
      state: 'loading',
      value: 0
    });
    
    try {
      const shopifyFilters = getShopifyFilters(filters, filterData);
      
      const result = await fetchFilteredProductsCount(collectionHandle, shopifyFilters);
      
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
  const handleFilterSelect = (categoryId, filterId) => {
    setEditableCopyOfSelectedFilters(prev => {
      // Check if this filter is already selected
      const existingFilterIndex = prev.findIndex(f => f.id === categoryId);
      
      let newFilters;
      if (existingFilterIndex >= 0) {
        // Filter exists, check if value is already selected
        const existingFilter = prev[existingFilterIndex];
        const valueIndex = existingFilter.values.indexOf(filterId);
        
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
            values: [...existingFilter.values, filterId]
          };
        }
      } else {
        // Filter doesn't exist, add it with the value
        newFilters = [...prev, { id: categoryId, values: [filterId] }];
      }
      
      // Update the filtered count
      const filterIds = newFilters.flatMap(filter => filter.values)
      fetchFilteredCount(filterIds);
      
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
    // setEditableCopyOfSelectedFilters([...selectedFilters]);
    setActiveFilterTab(0);
    
    // Reset the filtered count
    setFilteredProductsCount({
      state: 'uninitialized',
      value: 0
    });
    
    // If there are filters, fetch the count
    if (appliedFilters.length > 0) {
      fetchFilteredCount(appliedFilters);
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
    debugger
    const currentEditableCopyOfCategory = editableCopyOfSelectedFilters.find(it => it?.id === filter?.id)
    const numSelected = currentEditableCopyOfCategory?.values?.length;
    return (
      <Pressable
        key={`filter-tab-${index}`}
        style={[styles.filterTab, isActive && styles.activeFilterTab]}
        onPress={() => setActiveFilterTab(index)}
      >
        <Text style={[typography.family, styles.filterTabText, isActive && styles.activeFilterTabText]}>
          {filter.label}
        </Text>
        {numSelected > 0 && <Text style={[styles.filterTabText, {color: colors.secondaryMain}]}>{numSelected}</Text>}
      </Pressable>
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
  const renderFilterValueWithCheckbox = (category, value) => {
    const isSelected = isFilterValueSelected(category.id, value.id);
    
    return (
      <View key={`filter-value-${value.id}`} style={styles.filterValueItem}>
        <Checkbox
          label={value.label}
          initialValue={isSelected}
          onChange={(prevValue, newValue) => {
            handleFilterSelect(category.id, value.id);
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
    const filterIds = editableCopyOfSelectedFilters.flatMap(it => it.values);
    applyFilters(filterIds);
  };

  const currentSortLabel = sortOptions.find(it => it.value === sortOption && it.reverse === sortReverse)
  let numFiltersText = 'No Filter Applied';
  if (appliedFilters?.length === 1) {
    numFiltersText = '1 Filter Applied';
  } else if (appliedFilters?.length > 1) {
    numFiltersText = `${appliedFilters.length} Filters Applied`;
  }

  useEffect(() => {
    // console.log("selected filters: ", selectedFilters)
    let editableCopy = [];
    for (let i = 0; i < filterData.unflattenedFilters.length; ++i) {
      const category = filterData.unflattenedFilters[i];
      const copyOfCategory = {
        id: category.id,
        values: []
      };

      for (let j = 0; j < category.values.length; ++j) {
        const filter = category.values[j];
        if (appliedFilters.indexOf(filter.id) >= 0) {
          copyOfCategory.values.push(filter.id);
        }
      }
      editableCopy.push(copyOfCategory);
    }
    setEditableCopyOfSelectedFilters(editableCopy);
  }, [appliedFilters])

  return (
    <>
      {/* Bottom buttons for sort and filter */}
      <View style={styles.bottomButtonsContainer}>
        <Pressable 
          style={({pressed}) => [
            styles.bottomButton,
            pressed && {opacity: 0.5}
          ]}
          onPress={openSortBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'sort'} 
            style={styles.buttonIcon}
          />
          <View style={{flexDirection: 'column'}}>
            <Text style={[typography.family, styles.buttonText]}>Sort By</Text>
            {currentSortLabel && <Text style={[typography.family, styles.buttonSubtext]}>{currentSortLabel.label}</Text>}
          </View>
        </Pressable>

        <View style={styles.bottomButtonsSeparator}></View>
        
        <Pressable 
          style={({pressable}) => [
            styles.bottomButton,
            pressable && {opacity: 0.5}
          ]}
          onPress={openFilterBottomSheet}
        >
          <Icon 
            iconType={'Material Icon'} 
            name={'filter-outline'} 
            style={styles.buttonIcon}
          />
          <View style={{flexDirection: 'column'}}>
            <Text style={[typography.family, styles.buttonText]}>Filter</Text>
            <Text style={[typography.family, styles.buttonSubtext]}>{numFiltersText}</Text>
          </View>
        </Pressable>
      </View>
      
      {/* Bottom sheets */}
      <BottomSheet 
        ref={filterBottomSheetRef}
        title="Filter"
        sheetHeightFraction={0.7}
      >
        <View style={styles.filterBottomSheetContent}>
          <View style={styles.filterOptions}>
            {/* Filter tabs */}
            <View style={styles.filterTabsContainer}>
              <ScrollView>
                {filterData.unflattenedFilters.map(renderFilterTab)}
              </ScrollView>
            </View>
            
            {/* Filter values */}
            <View style={styles.filterValuesContainer}>
              {filterData.unflattenedFilters.length > 0 && activeFilterTab < filterData.unflattenedFilters.length && (
                <FlatList
                  data={filterData.unflattenedFilters[activeFilterTab].values}
                  renderItem={({ item }) => renderFilterValueWithCheckbox(filterData.unflattenedFilters[activeFilterTab], item)}
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
                <ActivityIndicator size="small" color={colors.secondaryMain} />
              ) : (
                <Text style={[typography.family, styles.filterCountText]}>
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
              <Pressable 
                style={({pressed}) => [
                  styles.applyButton,
                  pressed && {opacity: 0.5}
                ]}
                onPress={handleApplyFilters}
              >
                <Text style={[typography.family, styles.applyButtonText]}>
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </BottomSheet>
      
      <BottomSheet 
        ref={sortBottomSheetRef}
        title="Sort By"
        sheetHeightFraction={0.5}
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
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.dark10,
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
    color: colors.dark100,
  },
  buttonSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.dark70
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark100,
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
    borderBottomColor: colors.dark10,
  },
  selectedSortOption: {
    backgroundColor: colors.dark10,
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.dark90,
  },
  selectedSortOptionText: {
    fontWeight: '600',
    color: colors.dark100,
  },
  checkIcon: {
    fontSize: 20,
    color: colors.secondaryMain,
  },
  // Filter bottom sheet styles
  filterBottomSheetContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // Add relative positioning to the container
  },
  filterOptions: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingBottom: 60, // Add padding to account for the fixed action bar height
  },
  filterTabsContainer: {
    width: '40%',
    borderBottomWidth: 1,
    backgroundColor: colors.dark10,
    borderBottomColor: colors.dark30,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.dark10,
    justifyContent: "space-between",
    flexDirection: "row"
  },
  activeFilterTab: {
    backgroundColor: 'white',
  },
  filterTabText: {
    fontSize: 14,
    color: colors.dark100,
    fontWeight: '300'
  },
  activeFilterTabText: {
    color: colors.dark100,
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
    borderBottomColor: colors.dark10,
  },
  selectedFilterValue: {
    backgroundColor: colors.dark10,
  },
  filterValueText: {
    fontSize: 16,
    color: colors.dark90,
  },
  selectedFilterValueText: {
    fontWeight: '600',
    color: colors.dark100,
  },
  filterActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.dark20,
    position: 'absolute', // Position it absolutely
    bottom: 0, // Stick to the bottom
    left: 0,
    right: 0,
    backgroundColor: colors.dark20, // Add background color to ensure it's not transparent
  },
  filterCountContainer: {
    backgroundColor: colors.dark5,
    height: 60,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark90,
  },
  filterButtonsContainer: {
    backgroundColor: colors.buttonBg,
    height: 60,
    width: '50%',
    flexDirection: 'row',
  },
  applyButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark100,
  },
  disabledButton: {
    backgroundColor: colors.dark30,
  },
  disabledButtonText: {
    color: colors.dark60,
  },
});

export default Footer;
