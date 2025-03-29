
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {fetchProductData} from '../../../../extractedQueries/pdpquery';
import AboveThefoldContent from './AboveThefoldContent';
import DescriptionCard from './DescriptionCard';
import RecommendationsRoot from './recommendations/RecommendationsRoot';

export function ReactComponent({ model }) {
  const route = useRoute();
  const productHandle = route.params.productHandle;
  // const productHandle = model.get('productHandle');
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { width: screenWidth } = useApptileWindowDims();
  
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        const queryRunner = shopifyDSModel?.get('queryRunner');
        if (!queryRunner || !productHandle) {
          console.error("[APPTILE_AGENT] No query runner or product handle. Will retry in 100ms");
          return;
        }
        const result = await fetchProductData(queryRunner, productHandle);
        setProductData(result);
        setLoading(false);
      } catch (err) {
        console.error("[APPTILE_AGENT] Error fetching product data:", err);
        setError(err.message || "Failed to fetch product data");
        setLoading(false);
      }
    };

    if (shopifyDSModel && productHandle) {
      loadProductData();
    }
  }, [shopifyDSModel, productHandle]);

  // Extract and format product label
  const formatProductLabel = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) return null;
    
    const labelMetafield = metafields.find(meta => 
      meta && meta.key === 'product_label_1' && meta.namespace === 'custom'
    );
    
    if (!labelMetafield || !labelMetafield.value) return null;
    
    // Capitalize and remove non-alphabetical characters
    return labelMetafield.value
      .replace(/[^a-zA-Z ]/g, '')
      .toUpperCase();
  };

  // Parse rating JSON from metafield
  const parseRating = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) return "4.8";
    
    const ratingMetafield = metafields.find(meta => 
      meta && meta.key === 'rating' && meta.namespace === 'reviews'
    );
    
    if (!ratingMetafield || !ratingMetafield.value) return "4.8";
    
    try {
      // Parse the JSON string to get the rating object
      const ratingObj = JSON.parse(ratingMetafield.value);
      // Return the value, or fallback to 4.8 if not found
      return ratingObj.value || "4.8";
    } catch (e) {
      console.error("[APPTILE_AGENT] Error parsing rating JSON:", e);
      return "4.8";
    }
  };

  // Extract offer data from metafields
  const extractOffers = (metafields) => {
    if (!metafields || !Array.isArray(metafields)) return [];
    
    const offerMetafields = metafields.filter(meta => 
      meta && meta.key && meta.key.startsWith('pd_page_offer_') && meta.references && meta.references.nodes
    );
    
    const offers = [];
    
    offerMetafields.forEach(metafield => {
      if (metafield.references && metafield.references.nodes) {
        metafield.references.nodes.forEach(node => {
          if (node && node.fields && Array.isArray(node.fields)) {
            let offer = {};
            
            node.fields.forEach(field => {
              if (field.key === 'offer_headin_1') {
                offer.title = field.value;
              } else if (field.key === 'offer_description_1') {
                offer.description = field.value;
              } else if (field.key === 'offer_code_1') {
                offer.code = field.value;
              }
            });
            
            if (offer.title && offer.description) {
              offers.push(offer);
            }
          }
        });
      }
    });
    
    return offers;
  };

  // Extract product images
  const getProductImages = (product) => {
    if (!product || !product.images || !product.images.edges || !Array.isArray(product.images.edges)) {
      return [];
    }
    
    return product.images.edges
      .filter(edge => edge && edge.node && edge.node.url)
      .map(edge => edge.node.url);
  };

  // Mock variants data - in a real app, you would extract this from the product data
  const variantOptions = [
    { size: "50ml", price: "855", popular: true },
    { size: "30ml", price: "545", popular: false },
    { size: "15ml", price: "159", discount: "4%", originalPrice: "895", popular: false }
  ];
  
  // Extract product details
  const getProductDetails = (data) => {
    if (!data || !data.data || !data.data.productByHandle) {
      return null;
    }
    
    return data.data.productByHandle;
  };
  
  // Main render
  const product = getProductDetails(productData);
  const productImages = product ? getProductImages(product) : [];
  const productLabel = product ? formatProductLabel(product.metafields) : null;
  const rating = product ? parseRating(product.metafields) : "4.8";
  const offers = product ? extractOffers(product.metafields) : [];
  
  return (
    <View style={styles.container}>
      <AboveThefoldContent
        loading={loading}
        error={error}
        product={product}
        productImages={productImages}
        productLabel={productLabel}
        rating={rating}
        offers={offers}
        variantOptions={variantOptions}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        screenWidth={screenWidth}
      />

      {productData?.data?.productByHandle && (<DescriptionCard 
        productData={productData.data.productByHandle} 
        loading={loading} 
      />)}

      <RecommendationsRoot 
        loading={loading}
        error={error}
        data={productData}
        handleAddToCart={() => console.log("adding to cart")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    backgroundColor: '#ffffff'
  }
});

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
  name: 'Product Detail Page',
  defaultProps: {},
};
