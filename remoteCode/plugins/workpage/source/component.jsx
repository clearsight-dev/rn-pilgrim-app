import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel } from 'apptile-core';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';

export function ReactComponent({ model }) {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [data, setData] = useState(null);

  useEffect(() => {
    const queryRunner = shopifyDSModel?.get('queryRunner');
    fetchProductData(queryRunner, "3-redensyl-4-anagain-hair-growth-serum")
      .then(res => {
        setData(res)
      })
      .catch(err => {
        console.error(err.toString());
      })
  }, [shopifyDSModel]);

  return (
    <View
      style={{
        position: 'relative'
      }}
    >
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}

export const WidgetConfig = {
};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};
