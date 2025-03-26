
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims, Icon } from 'apptile-core';
import { useRoute } from '@react-navigation/native';
import RatingPill from '../../../../extractedQueries/RatingPill';
import { useSelector } from 'react-redux';
import {fetchProductData} from '../../../../extractedQueries/pdpquery';
import OfferCard from './OfferCard';
import VariantCard from './VariantCard';
import ImageCarousel from './ProductCarousel';

export function ReactComponent({ model }) {
  const route = useRoute();
  // const productHandle = model.get('productHandle');
  const productHandle = route.params.productHandle;
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

  // Enhanced variant selector component using the new VariantCard
  const VariantSelector = ({ variants, selectedIndex, onSelect }) => {
    // Determine which variants should show the timer
    // For this example, we'll show the timer on the first variant only
    const shouldShowTimer = (index) => index === 0;
    
    return (
      <View style={styles.variantSelectorContainer}>
        <Text style={styles.variantTitle}>Size: 50ml (1 Month Pack)</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.variantOptionsContainer}
        >
          {variants.map((variant, index) => (
            <TouchableOpacity
              key={`variant-${index}`}
              onPress={() => onSelect(index)}
              activeOpacity={0.7}
            >
              <VariantCard
                size={variant.size}
                price={variant.price}
                originalPrice={variant.originalPrice}
                discount={variant.discount}
                isPopular={variant.popular}
                isSelected={selectedIndex === index}
                showTimer={shouldShowTimer(index)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
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
  
  // If no offers found in metafields, use a default offer
  const displayOffers = offers.length > 0 ? offers : [
    {
      title: "B2G2 FREE + Free Jute Bag",
      description: "Add any 4 products & get 2 lowest cost products Free + Free Jute Bag",
      code: "Auto Applied"
    },
    {
      title: "FLAT ₹250 OFF",
      description: "Use code FLAT250 for orders above ₹999",
      code: "FLAT250"
    },
    {
      title: "FREE SHIPPING",
      description: "Free shipping on all orders above ₹499",
      code: "Auto-applied"
    }
  ];
  
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.scrollContainer}>
          {/* Skeleton loader for product carousel */}
          <View style={styles.skeletonCarousel}>
            <View style={styles.skeletonImageContainer}>
              <View style={styles.skeletonLabel} />
              <View style={styles.skeletonPagination}>
                {[...Array(4)].map((_, i) => (
                  <View 
                    key={`dot-${i}`} 
                    style={[
                      styles.skeletonPaginationDot, 
                      i === 0 && styles.skeletonPaginationDotActive
                    ]} 
                  />
                ))}
              </View>
            </View>
          </View>
          
          {/* Skeleton for product info */}
          <View style={styles.productInfoContainer}>
            {/* Bestseller tag skeleton */}
            <View style={styles.skeletonBestseller} />
            
            {/* Product Title skeleton */}
            <View style={styles.skeletonTitle} />
            
            {/* Product Subtitle skeleton */}
            <View style={styles.skeletonSubtitle} />
            
            {/* Price skeleton */}
            <View style={styles.skeletonPrice} />
            <View style={styles.skeletonTaxInfo} />
            
            {/* Rating skeleton */}
            <View style={styles.ratingContainer}>
              <View style={styles.skeletonRatingBadge} />
              <View style={styles.skeletonReviewCount} />
            </View>
            
            {/* Variant Selector skeleton */}
            <View style={styles.skeletonVariantTitle} />
            <View style={styles.skeletonVariantsContainer}>
              {[...Array(3)].map((_, i) => (
                <View key={`variant-${i}`} style={styles.skeletonVariantCard} />
              ))}
            </View>
            
            {/* Offers Section skeleton */}
            <View style={styles.skeletonOfferTitle} />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.offersScrollView}
              contentContainerStyle={styles.offersScrollContent}
            >
              {[...Array(3)].map((_, i) => (
                <View key={`offer-${i}`} style={styles.skeletonOfferCard} />
              ))}
            </ScrollView>
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : (
        <View style={styles.scrollContainer}>
          <ImageCarousel 
            images={productImages} 
            screenWidth={screenWidth} 
            productLabel={productLabel}
          />
          
          <View style={styles.productInfoContainer}>
            {/* Bestseller tag */}
            <View style={styles.bestsellerContainer}>
              <Text style={styles.bestsellerText}>BESTSELLER</Text>
            </View>
            
            {/* Product Title */}
            <Text style={styles.productTitle}>{product?.title || "Product Name"}</Text>
            
            {/* Product Subtitle */}
            <Text style={styles.productSubtitle}>
              {product?.metafields?.find(m => m?.key === "subtitle")?.value || 
               "Clinically tested to show new hair growth in 28 days"}
            </Text>
            
            {/* Price - VERTICALLY ARRANGED */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.price}>
                  {variantOptions[selectedVariant].price}
                </Text>
              </View>
              <Text style={styles.taxInfo}>MRP inclusive of all taxes</Text>
            </View>
            
            {/* Rating - Using parsed JSON value */}
            <View style={styles.ratingContainer}>
              <RatingPill rating={rating} size={16} backgroundColor="#25a69a" />
              <View style={styles.reviewCount}>
                <Text style={{marginRight: 5}}>
                  {product?.metafields?.find(m => m?.key === "rating_count")?.value || "7,332"} 
                </Text>
                <Icon 
                  iconType={'Material Icon'} 
                  name={'check-decagram'} 
                  style={{
                    marginRight: 2,
                    fontSize: 15,
                    color: '#00AEEF'
                  }}
                />
                <Text style={styles.verifiedText}> Verified reviews</Text>
              </View>
            </View>
            
            {/* Variant Selector */}
            <VariantSelector 
              variants={variantOptions} 
              selectedIndex={selectedVariant} 
              onSelect={setSelectedVariant} 
            />
            
            {/* Active Offers Section - Using the new offer card design */}
            <View style={styles.offersSection}>
              <Text style={styles.offersSectionTitle}>Active Offers</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.offersScrollView}
                contentContainerStyle={styles.offersScrollContent}
              >
                {displayOffers.map((offer, index) => (
                  <OfferCard 
                    key={`offer-${index}`}
                    title={offer.title}
                    description={offer.description}
                    code={offer.code}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    backgroundColor: '#ffffff'
  },
  scrollContainer: {
    flexGrow: 1
  },
  // Skeleton styles
  skeletonCarousel: {
    height: 450,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  skeletonImageContainer: {
    height: 450,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  skeletonLabel: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 80,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  skeletonPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  skeletonPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 3,
  },
  skeletonPaginationDotActive: {
    backgroundColor: '#c0c0c0',
  },
  skeletonBestseller: {
    width: 80,
    height: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonTitle: {
    width: '80%',
    height: 28,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonSubtitle: {
    width: '90%',
    height: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    borderRadius: 4,
  },
  skeletonPrice: {
    width: 100,
    height: 32,
    backgroundColor: '#f0f0f0',
    marginBottom: 4,
    borderRadius: 4,
  },
  skeletonTaxInfo: {
    width: 180,
    height: 14,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    borderRadius: 4,
  },
  skeletonRatingBadge: {
    width: 50,
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonReviewCount: {
    width: 120,
    height: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  skeletonVariantTitle: {
    width: 200,
    height: 20,
    backgroundColor: '#f0f0f0',
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 4,
  },
  skeletonVariantsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  skeletonVariantCard: {
    width: 100,
    height: 120,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    borderRadius: 8,
  },
  skeletonOfferTitle: {
    width: 120,
    height: 24,
    backgroundColor: '#f0f0f0',
    marginBottom: 16
  },
  skeletonOfferCard: {
    width: 280,
    height: 100,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    borderRadius: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  carouselWrapper: {
    position: 'relative',
  },
  carouselContainer: {
    height: 450,
  },
  carouselImage: {
    height: 450,
  },
  imagePlaceholder: {
    height: 450,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  labelContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    backgroundColor: '#1b7d6c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  labelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productInfoContainer: {
    padding: 16,
  },
  bestsellerContainer: {
    marginBottom: 8,
  },
  bestsellerText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#2A2A2A',
    marginBottom: 8,
  },
  productSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  taxInfo: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  reviewCount: {
    flexDirection: 'row',
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#2A2A2A',
  },
  // Variant selector styles
  variantSelectorContainer: {
    marginBottom: 24
  },
  variantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  variantOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Offers section styles
  offersSection: {
    marginTop: 16
  },
  offersSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  offersScrollView: {
    marginBottom: 16,
  },
  offersScrollContent: {
    paddingRight: 16,
  },
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
