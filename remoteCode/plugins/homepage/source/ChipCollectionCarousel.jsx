import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { navigateToScreen, useApptileWindowDims } from 'apptile-core';
import RelatedProductsCarousel from '../../../../extractedQueries/RelatedProductsCarousel';
import { colors, typography } from '../../../../extractedQueries/theme';
import { ChipCarouselSkeletonLoader } from '../../../../components/skeleton/chipCollection';

function ChipCollectionCarousel({
  config = {},
  data,
  style,
  onSelectShade,
  onSelectVariant,
  onFilterSelect,
  onFilterRemove,
  onFilterClear,
  loading,
}) {
  const { collection: collectionHandle, title, subtitle } = config;
  const { width: screenWidth } = useApptileWindowDims();
  const dispatch = useDispatch();

  const products = data.products;
  const error = data.error;

  const displayTitle =
    title ||
    collectionHandle.charAt(0).toUpperCase() +
    collectionHandle.slice(1).replace(/-/g, ' ');

  const handleSeeAllClick = () => {
    dispatch(navigateToScreen('Collection', { collectionHandle }));
  };

  if (loading) {
    return <ChipCarouselSkeletonLoader width={screenWidth} />;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <View style={{ flexGrow: 1 }}>
          <Text style={typography.heading19}>{displayTitle}</Text>
          {subtitle && (
            <Text style={[typography.body14, { marginTop: 8, letterSpacing: 1 }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleSeeAllClick}>
          <Text style={[typography.heading14, styles.seeAllButton]}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips header */}
      {/* <Header
        filterData={filterData}
        appliedFilters={selectedFilters}
        onFilterRemove={filter =>
          onFilterRemove(collectionHandle, filter, selectedFilters, filterData)
        }
        onFilterSelect={filter =>
          onFilterSelect(collectionHandle, filter, selectedFilters, filterData)
        }
        onClearAllFilters={() =>
          onFilterClear(collectionHandle, null, selectedFilters, filterData)
        }
      /> */}

      {/* Cards */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[typography.body14, styles.errorText]}>Error: {error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[typography.body14, styles.noProductsText]}>No products found</Text>
        </View>
      ) : (
        <RelatedProductsCarousel
          title=""
          products={products}
          style={styles.carousel}
          onSelectShade={onSelectShade}
          onSelectVariant={onSelectVariant}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  seeAllButton: {
    color: colors.secondaryMain,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.accentBurgundy,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 16,
    color: colors.dark80,
  },
  carousel: {
    marginTop: 8,
  },
});

export default memo(ChipCollectionCarousel);
