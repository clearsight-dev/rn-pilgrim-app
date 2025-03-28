import React, { useState, useEffect } from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import CollectionCarouselComponent from './CollectionCarousel';
import {useSelector, shallowEqual} from 'react-redux';
import {datasourceTypeModelSel} from 'apptile-core';
import {fetchCollectionCarouselData} from '../../../../extractedQueries/collectionqueries';

/**
 * MultiCollectionCarousel component that displays multiple collection carousels
 * for the specified collection handles.
 * Data fetching is now centralized in this component to prevent re-renders in child components.
 */
export default function MultiCollectionCarousel() {
  // Collection handles to display
  const collectionHandles = ['pore-care', 'hair-care', 'makeup'];
  const [collectionsData, setCollectionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get queryRunner from Redux store
  const queryRunner = useSelector(state => {
    const shopifyDSModel = datasourceTypeModelSel(state, 'shopifyV_22_10')
    const queryRunner = shopifyDSModel.get('queryRunner');
    return queryRunner;
  }, shallowEqual);

  // Fetch data for all collections
  useEffect(() => {
    console.log("[AGENT] Fetching data for all collections in MultiCollectionCarousel");
    
    const fetchAllCollectionsData = async () => {
      if (!queryRunner) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch data for all collections in parallel
        const results = await Promise.all(
          collectionHandles.map(async (handle) => {
            try {
              const result = await fetchCollectionCarouselData(queryRunner, handle);
              return { handle, data: result, error: null };
            } catch (err) {
              console.error(`Error fetching data for collection ${handle}:`, err);
              return { handle, data: null, error: err.message || 'Failed to load collection data' };
            }
          })
        );
        
        // Convert results to an object with collection handles as keys
        const dataObject = results.reduce((acc, { handle, data, error }) => {
          acc[handle] = { data, error };
          return acc;
        }, {});
        
        setCollectionsData(dataObject);
        setError(null);
      } catch (err) {
        console.error('Error fetching collections data:', err);
        setError('Failed to load collections data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllCollectionsData();
  }, [queryRunner]);

  console.log("[AGENT] rendering multicollection carousel")
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00909E" />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {collectionHandles.map((handle) => {
        const collectionData = collectionsData[handle] || {};
        
        return (
          <CollectionCarouselComponent 
            key={handle} 
            collectionHandle={handle}
            carouselData={collectionData.data}
            error={collectionData.error}
            loading={false} // We're handling loading at the parent level
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
  },
});
