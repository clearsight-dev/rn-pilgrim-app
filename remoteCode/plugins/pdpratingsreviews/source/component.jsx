import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, GetRegisteredPlugin } from 'apptile-core';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';
import RatingCard from './RatingCard';

export function ReactComponent({ model }) {
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [rating, setRating] = useState(2); // Default rating is 2
  const [ratingCount, setRatingCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const judgemeDSModel = useSelector(state => datasourceTypeModelSel(state, 'judgeMe'));

  useEffect(() => {
    async function getReviews() {
      setIsLoading(true);
      const judgeMeQueryRunner = judgemeDSModel?.get('queryRunner');
      const judgeMeDs = GetRegisteredPlugin('judgeMe');
      const apiToken = judgemeDSModel.get('apiToken');
      const shopDomain = judgemeDSModel.get('shopDomain');
      const judgeMeQueries = judgeMeDs.getQueries();

      // Helper function to format endpoint with API token and shop domain
      const formatEndpoint = (endpoint) => {
        return endpoint.includes('?')
          ? `${endpoint}&api_token=${apiToken}&shop_domain=${shopDomain}`
          : `${endpoint}?api_token=${apiToken}&shop_domain=${shopDomain}`;
      };

      // Helper function to transform review data
      const transformReviewData = (reviews) => {
        return (reviews ?? []).map(review => ({
          id: review.id,
          title: review.title,
          body: review.body,
          rating: review.rating,
          verified: review.verified,
          hidden: review.hidden,
          created_at: review.created_at,
          name: review.reviewer?.name || 'Anonymous',
          pictures: review.pictures.map(picture => ({
            id: picture.urls.small,
            url: picture.urls.small
          })),
          has_published_pictures: review.has_published_pictures
        }));
      };

      // Get product ID
      const getProduct = judgeMeQueries.getProduct;
      let endpoint = getProduct.endpointResolver(getProduct.endpoint, {
        handle: '3-redensyl-4-anagain-hair-growth-serum',
      });
      endpoint = formatEndpoint(endpoint);
      const productRes = await judgeMeQueryRunner.runQuery('get', endpoint, null);
      const judgeMeId = productRes?.data?.product?.id;

      if (judgeMeId) {
        const listProductReviews = judgeMeQueries.listProductReviews;
        let allReviews = [];
        let imageCount = 0;
        
        // 1. Fetch 100 reviews with rating 4 (page 1)
        endpoint = listProductReviews.endpointResolver(listProductReviews.endpoint, {
          judgeMeProductId: judgeMeId,
          size: 100,
          rating: 5
        }, {
          after: 1
        });
        endpoint = formatEndpoint(endpoint);
        const res1 = await judgeMeQueryRunner.runQuery('get', endpoint, null, {});
        const reviewData1 = transformReviewData(res1?.data?.reviews);
        allReviews = [...reviewData1];
        
        // Count images in first batch
        imageCount = allReviews.filter(review => review.has_published_pictures).length;
        
        // 2. If images < 4, fetch second page of reviews with rating 5
        if (imageCount < 1) {
          endpoint = listProductReviews.endpointResolver(listProductReviews.endpoint, {
            judgeMeProductId: judgeMeId,
            size: 100,
            rating: 5
          }, {
            after: 2
          });
          endpoint = formatEndpoint(endpoint);
          const res2 = await judgeMeQueryRunner.runQuery('get', endpoint, null, {});
          const reviewData2 = transformReviewData(res2?.data?.reviews);
          allReviews = [...allReviews, ...reviewData2];
          
          // Recount images
          imageCount = allReviews.filter(review => review.has_published_pictures).length;
        }
        
        // 3. If still no images, fetch reviews without rating filter (pages 1-3)
        if (imageCount < 1) {
          for (let page = 1; page <= 3; page++) {
            if (imageCount >= 1) break;
            
            endpoint = listProductReviews.endpointResolver(listProductReviews.endpoint, {
              judgeMeProductId: judgeMeId,
              size: 100
              // No rating filter
            }, {
              after: page
            });
            endpoint = formatEndpoint(endpoint);
            const resUnfiltered = await judgeMeQueryRunner.runQuery('get', endpoint, null, {});
            const reviewDataUnfiltered = transformReviewData(resUnfiltered?.data?.reviews);
            
            // Add new reviews that aren't already in the array (avoid duplicates)
            const newReviews = reviewDataUnfiltered.filter(
              newReview => !allReviews.some(existingReview => existingReview.id === newReview.id)
            );
            allReviews = [...allReviews, ...newReviews];
            
            // Recount images
            imageCount = allReviews.filter(review => review.has_published_pictures).length;
          }
        }
        
        // 4. Bring verified purchase reviews to the front (up to 2)
        const verifiedReviews = allReviews.filter(review => review.verified === 'verified-purchase');
        const nonVerifiedReviews = allReviews.filter(review => review.verified !== 'verified-purchase');
        
        // 5. Bring reviews with images to positions 2 onwards (up to 10)
        const reviewsWithImages = nonVerifiedReviews.filter(review => review.has_published_pictures);
        const reviewsWithoutImages = nonVerifiedReviews.filter(review => !review.has_published_pictures);
        
        // Construct the final array
        let finalReviews = [];
        
        // Add up to 2 verified reviews at the front
        finalReviews = [...verifiedReviews.slice(0, 2)];
        
        // Add up to 10 reviews with images starting at index 2
        finalReviews = [...finalReviews, ...reviewsWithImages.slice(0, 10)];
        
        // Add remaining reviews
        finalReviews = [
          ...finalReviews,
          ...verifiedReviews.slice(2),
          ...reviewsWithImages.slice(10),
          ...reviewsWithoutImages
        ];
        
        // 6. Limit to 200 reviews
        finalReviews = finalReviews.slice(0, 200);
        
        setReviews(finalReviews);
        setIsLoading(false);
      }
    }
    getReviews();
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
      photos={reviews.filter(review => review.has_published_pictures).flatMap(review => review.pictures)}
      reviews={reviews}
      isLoading={isLoading}
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

