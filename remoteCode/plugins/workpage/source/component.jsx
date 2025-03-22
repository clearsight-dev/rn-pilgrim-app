import React, { useEffect, useState } from 'react';
import { 
  View, 
  SafeAreaView
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, GetRegisteredPlugin } from 'apptile-core';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import RatingCard from './RatingCard';

export function ReactComponent({ model }) {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [rating, setRating] = useState(2); // Default rating is 2
  const [ratingCount, setRatingCount] = useState(0);
  const [userImages, setUserImages] = useState([]);
  const judgemeDSModel = useSelector(state => datasourceTypeModelSel(state, 'judgeMe'));

  useEffect(() => {
    async function getImages() {
      const judgeMeQueryRunner = judgemeDSModel?.get('queryRunner');
      const judgeMeDs = GetRegisteredPlugin('judgeMe');
      const apiToken = judgemeDSModel.get('apiToken');
      const shopDomain = judgemeDSModel.get('shopDomain');
      const judgeMeQueries = judgeMeDs.getQueries();

      const getProduct = judgeMeQueries.getProduct;
      let endpoint = getProduct.endpointResolver(getProduct.endpoint, {handle: '3-redensyl-4-anagain-hair-growth-serum'})
      endpoint = endpoint.includes('?')
        ? `${endpoint}&api_token=${apiToken}&shop_domain=${shopDomain}`
        : `${endpoint}?api_token=${apiToken}&shop_domain=${shopDomain}`;
      const res = await judgeMeQueryRunner.runQuery('get', endpoint, null, {cachePolicy: 'cache-first'})
      const judgeMeId = res?.data?.product?.id;

      if (judgeMeId) {
        const listProductReviews = judgeMeQueries.listProductReviews;
        endpoint = listProductReviews.endpointResolver(listProductReviews.endpoint, {judgeMeProductId: judgeMeId})
        endpoint = endpoint.includes('?')
          ? `${endpoint}&api_token=${apiToken}&shop_domain=${shopDomain}&per_page=100&page=3`
          : `${endpoint}?api_token=${apiToken}&shop_domain=${shopDomain}&per_page=100&page=3`;
        const res = await judgeMeQueryRunner.runQuery('get', endpoint, null, {cachePolicy: 'cache-first'})
        const pictures = (res?.data?.reviews ?? []).filter(it => it.has_published_pictures)
          // TODO(gaurav): filter by hidden
          .flatMap(it => it.pictures.map(picture => ({
            id: picture.urls.small,
            url: picture.urls.small
          })))
        console.log(pictures)
        setUserImages(pictures);
      }
    }
    getImages();
  }, [judgemeDSModel])

  useEffect(() => {
    const queryRunner = shopifyDSModel?.get('queryRunner');
    fetchProductData(queryRunner, "3-redensyl-4-anagain-hair-growth-serum")
      .then(res => {
        // Extract rating and rating_count from metafields
        if (res?.data?.productByHandle?.metafields) {
          const metafields = res.data.productByHandle.metafields;
          
          // Find rating metafield
          const ratingMetafield = metafields.find(
            metafield => metafield.key === 'rating' && metafield.namespace === 'reviews'
          );
          
          // Find rating_count metafield
          const ratingCountMetafield = metafields.find(
            metafield => metafield.key === 'rating_count' && metafield.namespace === 'reviews'
          );
          
          // Update state with metafield values if they exist
          if (ratingMetafield && ratingMetafield.value) {
            try {
              const rating = JSON.parse(ratingMetafield.value);
              setRating(parseFloat(rating.value));
            } catch (err) {
              console.error("Failed to parse rating");
            }
          }
          
          if (ratingCountMetafield && ratingCountMetafield.value) {
            setRatingCount(parseInt(ratingCountMetafield.value, 10));
          }
        }
      })
      .catch(err => {
        console.error(err.toString());
      });
  }, [shopifyDSModel]);

  return (
    <RatingCard 
      rating={rating} 
      ratingCount={ratingCount} 
      photos={userImages} // Placeholder for now
    />
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
