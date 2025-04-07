import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import RelatedProductCard from './RelatedProductCard';

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

  return {
    id: product.id,
    firstVariantId: firstVariant?.id ?? null,
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
    weight: firstVariant?.weight,
    weightUnit: firstVariant?.weightUnit,
    subtitle: product.subtitle,
    offers
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
  // console.log('Rendering RelatedProductsCarousel');
  // const {queryRunner, addLineItemToCart} = useShopifyQueryAndAddtoCart();

  // Function to fetch product data
  // async function cacheProductDetails(productHandle) {
  //   if (!queryRunner) return;

  //   try {
  //     await fetchProductData(queryRunner, productHandle);
  //   } catch (error) {
  //     console.error(`Error fetching product ${productHandle}:`, error);
  //   }
  // }

  // async function cacheMultipleProducts(products) {
  //   if (!products || products.length === 0) return;
  //   for (let i = 0; i < products.length; ++i) {
  //     await cacheProductDetails(products[i].handle);
  //     await new Promise(resolve => {
  //       setTimeout(() => {
  //         resolve();
  //       }, 500);
  //     });
  //   }
  // }

  // const handleAddToCart = useCallback(
  //   product => {
  //     console.log('Adding product: ', product);
  //     // if (addLineItemToCart) {
  //     //   addLineItemToCart(product.firstVariantId);
  //     // } else {
  //     //   console.error('no function found for adding to cart!');
  //     // }
  //   },
  //   // [addLineItemToCart],
  //   []
  // );

  // Initialize with the specified number of products
  // useEffect(() => {
  //   const initialProducts = products.slice(
  //     0,
  //     Math.min(initialProductsToLoad, products.length),
  //   );
  //   // cacheMultipleProducts(initialProducts);
  // }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

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
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default RelatedProductsCarousel;
