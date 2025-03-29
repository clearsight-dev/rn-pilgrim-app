import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { datasourceTypeModelSel } from 'apptile-core';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import RecommendationsRoot from './RecommendationsRoot';

export function ReactComponent({ model }) {
  const route = useRoute();
  const productHandle = route.params.productHandle;
  // const productHandle = model.get('productHandle');
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryRunner = shopifyDSModel?.get('queryRunner');
    let timeout;
    if (queryRunner && productHandle) {
      timeout = setLoading(true);
        setTimeout(() => {
          fetchProductData(queryRunner, productHandle)
            .then(res => {
              setData(res);
              setLoading(false);
            })
            .catch(err => {
              console.error(err.toString());
              setError(err.toString());
              setLoading(false);
            });
        }, 500)
      
    }
    return () => {clearTimeout(timeout)}
  }, [shopifyDSModel, productHandle]);

  // Handle add to cart action
  const handleAddToCart = () => {
    Alert.alert('Success', 'Products added to cart!');
  };

  // Forward data to the UI component
  return (
    <RecommendationsRoot 
      loading={loading}
      error={error}
      data={data}
      handleAddToCart={handleAddToCart}
    />
  );
}

export const WidgetConfig = {
  productHandle: ''
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'productHandle',
      props: {
        label: 'Product Handle'
      }
    }
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};
