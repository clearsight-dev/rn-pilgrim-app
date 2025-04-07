import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Icon } from 'apptile-core';
import RatingPill from '../../../../extractedQueries/RatingPill';
import OfferCard from './OfferCard';
import VariantCard from '../../../../extractedQueries/VariantCard';

// Enhanced variant selector component using the new VariantCard
function InlineVariantSelector ({ 
  variants,
  selectedVariant,
  setSelectedVariant,
}) {
  return (
    <View style={styles.variantSelectorContainer}>
      { selectedVariant?.title && (
        <Text style={styles.variantTitle}>
          Size: {selectedVariant.title}
        </Text>
      )}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.variantOptionsContainer}
      >
        {variants.map((variant, index) => {
          return (
            <Pressable
              key={`variant-${index}`}
              onPress={() => setSelectedVariant(variant)}
              activeOpacity={0.7}
            >
              <VariantCard
                variant={variant}
                optionName={"Size"}
                isSelected={selectedVariant?.id === variant.id}
                isPopular={index == 0}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

function ProductInfo({ 
  product, 
  offers, 
  variants,
  selectedVariant, 
  setSelectedVariant 
}) {
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
    <View style={styles.productInfoContainer}>
      {/* Bestseller tag */}
      {
        (product?.productLabel1?.value ?? "").toString().toLowerCase().includes("bestseller") && 
        <View style={styles.bestsellerContainer}>
          <Text style={styles.bestsellerText}>BESTSELLER</Text>
        </View>
      }
      
      {/* Product Title */}
      <Text style={styles.productTitle}>{product?.title || "Product Name"}</Text>
      
      {/* Product Subtitle */}
      <Text style={styles.productSubtitle}>
        {product?.subtitle?.value}
      </Text>
      
      {/* Price - VERTICALLY ARRANGED */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceSymbol}>₹</Text>
          <Text style={styles.price}>
            {selectedVariant?.price?.amount}
          </Text>
        </View>
        <Text style={styles.taxInfo}>MRP inclusive of all taxes</Text>
      </View>
      
      {/* Rating - Using parsed JSON value */}
      <View style={styles.ratingContainer}>
        <RatingPill rating={product?.rating} size={16} backgroundColor="#25a69a" />
        <View style={styles.reviewCount}>
          <Text style={{marginRight: 5}}>
            {product?.reviews?.value} 
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
          <Text style={styles.verifiedText}>Verified reviews</Text>
        </View>
      </View>
      
      {/* Variant Selector */}
      {product?.variantsCount > 1 && (
        <InlineVariantSelector 
          variants={variants}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant} 
        />
      )}
      
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
  );
};

const styles = StyleSheet.create({
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

export default ProductInfo;
