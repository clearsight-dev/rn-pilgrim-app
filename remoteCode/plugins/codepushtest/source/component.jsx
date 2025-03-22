
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { useSelector } from 'react-redux';
import {fetchProductData} from '../../../../extractedQueries/pdpquery';
import { OfferCard } from './OfferCard';
import VariantCard from './VariantCard';
import ImageCarousel from './ProductCarousel';

export function ReactComponent({ model }) {
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
        const result = await fetchProductData(queryRunner, "3-redensyl-4-anagain-hair-growth-serum");
        setProductData(result);
        setLoading(false);
      } catch (err) {
        console.error("[APPTILE_AGENT] Error fetching product data:", err);
        setError(err.message || "Failed to fetch product data");
        setLoading(false);
      }
    };

    if (shopifyDSModel) {
      loadProductData();
    }
  }, [shopifyDSModel]);

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading product data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
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
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {rating} ★
                </Text>
              </View>
              <Text style={styles.reviewCount}>
                {product?.metafields?.find(m => m.key === "rating_count")?.value || "7,332"} 
                <Text style={styles.verifiedText}> Verified reviews</Text>
              </Text>
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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    fontSize: 28,
    fontWeight: 'bold',
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
  ratingBadge: {
    backgroundColor: '#25a69a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewCount: {
    fontSize: 14,
    color: '#333',
  },
  verifiedText: {
    color: '#666',
    textDecorationLine: 'underline',
  },
  // Variant selector styles
  variantSelectorContainer: {
    marginBottom: 24,
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
    marginTop: 16,
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

export const WidgetConfig = {};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Product Detail Page',
  defaultProps: {},
};
