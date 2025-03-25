import React from 'react';
import {useWindowDimensions} from 'react-native';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

const CollectionsGridSquare = ({collections = []}) => {
  const {width} = useWindowDimensions();
  const itemWidth = (width - 48 - 24) / 3; // (device_width - margin - gap) / columns

  const handleCollectionPress = collectionHandle => {
    console.log(`Navigate to collection: ${collectionHandle}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Budget-friendly</Text>
        <Text style={styles.subtitle}>Your Perfect Pairing!</Text>
      </View>

      <View style={styles.gridContainer}>
        {collections.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.gridItem,
              {width: itemWidth, height: itemWidth * 1.3},
            ]}
            onPress={() => handleCollectionPress(item.collectionHandle)}>
            <Image
              source={{uri: item.backgroundImage}}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            {/* <View style={styles.overlay} /> */}
            <View style={styles.contentContainer}>
              <Text style={styles.priceText}>{item.title}</Text>
              <Text style={styles.categoryText}>{item.collectionName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  headerContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 12, // Compensate for item margin
    gap: 8,
  },
  gridItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    margin: 4,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    transform: [{scale: 1.4}, {translateX: 15}], // change as required
  },
  contentContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CollectionsGridSquare;
