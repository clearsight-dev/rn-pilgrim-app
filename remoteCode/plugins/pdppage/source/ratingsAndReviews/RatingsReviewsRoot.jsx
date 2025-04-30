import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, GetRegisteredPlugin } from 'apptile-core';
import RatingCard from './RatingCard';

function RatingsReviewsRoot({ product }) {
  const productHandle = product?.handle;
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [judgeMeProductId, setJudgeMeProductId] = useState();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const judgemeDSModel = useSelector(state => datasourceTypeModelSel(state, 'judgeMe'));

  const onSubmitReview = useCallback(async (rating, title, body) => {
    const judgeMeQueryRunner = judgemeDSModel?.get('queryRunner');
    const judgeMeDs = GetRegisteredPlugin('judgeMe');
    const apiToken = judgemeDSModel.get('apiToken');
    const shopDomain = judgemeDSModel.get('shopDomain');
    const judgeMeQueries = judgeMeDs.getQueries();

    const formatEndpoint = (endpoint) => {
      return endpoint.includes('?')
        ? `${endpoint}&api_token=${apiToken}&shop_domain=${shopDomain}`
        : `${endpoint}?api_token=${apiToken}&shop_domain=${shopDomain}`;
    }

    const postProductReview = judgeMeQueries.postProductReview;
    const endpoint = formatEndpoint(postProductReview.endpoint);
    const loggedInUser = shopifyDSModel.get('loggedInUser');
    if (loggedInUser) {
      const productRes = await judgeMeQueryRunner.runQuery('post', endpoint, {
        test: shopifyDSModel.get('description'),
        platform: 'shopify',
        name: loggedInUser?.firstName + " " + loggedInUser?.lastName,
        email: loggedInUser?.email,
        rating,
        title,
        body,
        id: judgeMeProductId,
      });
      console.log("[AGENT] Review submitted: ", productRes);
    } else {
      throw new Error("Cannot submit review without logging in first!");
    }
  }, [judgemeDSModel, judgeMeProductId, shopifyDSModel])

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
        handle: productHandle,
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
        setJudgeMeProductId(judgeMeId);
        setReviews(finalReviews);
        setIsLoading(false);
      }
    }
    let timeout;
    if (productHandle) {
      timeout = setTimeout(() => {
        getReviews();
      }, 500)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [judgemeDSModel, productHandle])

  return (
    <RatingCard 
      rating={product?.rating} 
      ratingCount={product?.reviews?.value} 
      photos={reviews.filter(review => review.has_published_pictures).flatMap(review => review.pictures)}
      reviews={reviews}
      isLoading={isLoading}
      consumerStudyResults={product?.studyResults}
      onSubmitReview={onSubmitReview}
    />
  );
};

export default RatingsReviewsRoot;
