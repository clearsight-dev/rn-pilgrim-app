import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import RelatedProductCard from './RelatedProductCard';
import {addLineItemToCart} from './selectors';

export function formatProductsForCarousel(products) {
  if (!products || !Array.isArray(products)) return [];
  return products.map(product => {
    const firstVariant = product.variants?.edges?.[0]?.node;
    let parsedRating = 0;
    try {
      parsedRating = parseFloat(JSON.parse(product.rating)?.value);
    } catch (err) {
      parsedRating = 0;
    }

    return {
      id: product.id,
      firstVariantId: firstVariant?.id ?? null,
      title: product.title,
      handle: product.handle,
      featuredImage: product.featuredImage,
      price: firstVariant?.price ?? {amount: 0},
      compareAtPrice: firstVariant?.compareAtPrice ?? {amount: 0},
      variantsCount: product.variantsCount?.count ?? 0,
      productType: product.productType,
      options: product.options || [],
      variants: [product.variants?.edges?.[0]?.node],
      rating: parsedRating,
      productLabel1: product.productLabel1,
      productLabel2: product.productLabel2,
      weight: firstVariant?.weight,
      weightUnit: firstVariant?.weightUnit
    }
  });
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
            onAddToCart={product => addLineItemToCart(product.firstVariantId)}
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
