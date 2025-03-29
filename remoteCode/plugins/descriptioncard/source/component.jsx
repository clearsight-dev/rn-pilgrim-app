
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { datasourceTypeModelSel } from 'apptile-core';
import { useSelector } from 'react-redux';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import DescriptionCard from './DescriptionCard';

export function ReactComponent({ model }) {
  const route = useRoute();
  const productHandle = route.params.productHandle;
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get shopify query runner
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  
  // Fetch product data
  useEffect(() => {
    const loadData = async () => {
      try {
        const queryRunner = shopifyDSModel?.get('queryRunner');
        if (!queryRunner || !productHandle) {
          console.error("[APPTILE_AGENT] No query runner available");
          return;
        }
        
        const result = await fetchProductData(queryRunner, productHandle);
        setProductData(result.data.productByHandle);
      } catch (error) {
        console.error("[APPTILE_AGENT] Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    let timeout;
    if (shopifyDSModel && productHandle) {
      timeout = setTimeout(() => {
        loadData();
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [shopifyDSModel, productHandle]);
  
  // Render the DescriptionCard component with the fetched data
  return <DescriptionCard productData={productData} loading={loading} />;
}


export const WidgetConfig = {
  productHandle: '',
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
  ]
};

export const WrapperTileConfig = {
  name: "Product Details Tabs",
  defaultProps: {
    productHandle: {
      label: "Product Handle",
      defaultValue: "hair-growth-serum",
    }
  },
};

export const PropertySettings = {};
