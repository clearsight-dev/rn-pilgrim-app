import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import RelatedProductCard from './RelatedProductCard';
import { typography } from './theme';

export function formatProduct(product) {
  const firstVariant = product.variants?.edges?.[0]?.node;
  let parsedRating = 0;
  try {
    parsedRating = parseFloat(JSON.parse(product.rating.value)?.value ?? 0);
    parsedRating = parseFloat(parsedRating.toFixed(1));
  } catch (err) {
    parsedRating = 0;
  }

  let offers = [];
  function extractOffers(offerNodes) {
    if (Array.isArray(offerNodes)) {
      for (let i = 0; i < offerNodes.length; ++i) {
        const fields = offerNodes[i].fields;
        const offer = fields.reduce((accum, item) => {
          if (item.key.startsWith("offer_code_")) {
            accum.code = item.value;
          } else if (item.key.startsWith("offer_description_")) {
            accum.description = item.value;
          } else if (item.key.startsWith("offer_headin_")) {
            accum.title = item.value;
          }
          return accum;
        }, {});

        offers.push(offer)
      }
    }
  }

  extractOffers(product.offers1?.references?.nodes);
  extractOffers(product.offers2?.references?.nodes);
  extractOffers(product.offers3?.references?.nodes);

  const benefitsImages = [];
  if (product.benefits_url_1?.value) {
    benefitsImages.push({imageUrl: product.benefits_url_1?.value});
  }
  
  if (product.benefits_url_2?.value) {
    benefitsImages.push({imageUrl: product.benefits_url_2?.value});
  }

  if (product.benefits_url_3?.value) {
    benefitsImages.push({imageUrl: product.benefits_url_3?.value});
  }

  const textBenefits = {title: "", items: []};
  if (product.text_benefits_title?.value) {
    textBenefits.title = product.text_benefits_title?.value;
  }

  if (product.text_benefits_body?.value) {
    textBenefits.items = (product.text_benefits_body?.value ?? "").split("•");
  }

  const ingredients = [];
  if (product.ingredients_url_1?.value) {
    ingredients.push({imageUrl: product.ingredients_url_1?.value});
  }

  if (product.ingredients_url_2?.value) {
    ingredients.push({imageUrl: product.ingredients_url_2?.value});
  }

  if (product.ingredients_url_3?.value) {
    ingredients.push({imageUrl: product.ingredients_url_3?.value});
  }

  const studyResults = [];
  if (product.consumer_study_results_1?.value) {
    studyResults.push(product.consumer_study_results_1?.value);
  }

  if (product.consumer_study_results_2?.value) {
    studyResults.push(product.consumer_study_results_2?.value);
  }

  if (product.consumer_study_results_2?.value) {
    studyResults.push(product.consumer_study_results_2?.value);
  }

  return {
    id: product.id,
    firstVariantId: firstVariant?.id ?? null,
    availableForSale: product.availableForSale,
    title: product.title,
    handle: product.handle,
    featuredImage: product.featuredImage,
    images: (product.images?.edges ?? []).map(edge => edge.node),
    price: firstVariant?.price ?? {amount: 0},
    compareAtPrice: firstVariant?.compareAtPrice ?? {amount: 0},
    variantsCount: product.variantsCount?.count ?? 0,
    productType: product.productType,
    options: product.options?.[0]?.optionValues || [],
    variants: [product.variants?.edges?.[0]?.node ?? {}],
    rating: parsedRating,
    reviews: product?.reviews,
    productLabel1: product.productLabel1,
    productLabel2: product.productLabel2,
    productLabel3: product.productLabel3,
    weight: firstVariant?.weight,
    weightUnit: firstVariant?.weightUnit,
    subtitle: product.subtitle,
    offers,
    benefitsImages,
    textBenefits,
    ingredients,
    howToUse: product.how_to_use?.value,
    studyResults,
    questions: product.questions,
    answers: product.answers,
    productSize: product?.product_size?.value,
    productShortTitle: product?.product_short_title?.value,
  }
}

export function formatProductsForCarousel(products) {
  if (!products || !Array.isArray(products)) return [];
  return products.map(product => formatProduct(product));
};

function RelatedProductsCarousel({
  title = 'Customers also liked',
  products = [],
  style,
  // initialProductsToLoad = 2, // Default to loading 2 products initially
  onSelectShade = () => {console.log("Handler for select shade not provided")},
  onSelectVariant = () => {console.log("Handler for select variant not provided")},
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      {title && <Text style={[typography.heading19,styles.title ]}>{title}</Text>}

      {/* Horizontal Scrollable List */}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        // onScroll={handleScroll}
        // onEndDrag={() => cacheMultipleProducts(products)}
        // onMomentumScrollEnd={() => cacheMultipleProducts(products)}
        // scrollEventThrottle={60}
        initialNumToRender={2}
        windowSize={3}
        maxToRenderPerBatch={5}
        renderItem={({item: product, index}) => (
          <RelatedProductCard
            key={product.handle + index}
            product={product}
            onSelectShade={onSelectShade}
            onSelectVariant={onSelectVariant}
          />
        )}
        keyExtractor={(product, index) => product.handle || index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default RelatedProductsCarousel;
