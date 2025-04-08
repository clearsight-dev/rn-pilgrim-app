import React, {useRef} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Carousel} from '../../../../extractedQueries/ImageCarousel';
import { Image } from '../../../../extractedQueries/ImageComponent';
import ProductInfo from './ProductInfo';
import AboveThefoldSkeleton from './AboveThefoldSkeleton';

function AboveThefoldContent({ 
  loading, 
  error, 
  product, 
  variants,
  selectedVariant, 
  setSelectedVariant,
  screenWidth
}) {
  const carouselRef = useRef(null);
  if (loading) {
    return <AboveThefoldSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  let productImages;
  if (Array.isArray(product?.images)) {
    productImages = product.images.slice();
  } else {
    productImages = [];
  }

  for (let i = 0; i < variants.length; ++i) {
    productImages.push({...variants[i].image, variantId: variants[i].id});
  }

  return (
    <View style={styles.scrollContainer}>
      <Carousel
        ref={carouselRef}
        flatlistData={productImages}
        renderChildren={({item}, index) => {
          return (
            <Image 
              source={{uri: item.url + "-" + index}}
              resizeMode="contain"
              style={{
                width: screenWidth,
                aspectRatio: 1,
                minHeight: 100,
              }}
            />   
          );
        }}
        width={screenWidth}
        aspectRatio={1}
      />
      {/* <Text>{JSON.stringify(productImages, null, 2)}</Text> */}
      <ProductInfo 
        product={product}
        productLabel={product?.productLabel2?.value || product?.productLabel1?.value || null}
        offers={product?.offers}
        variants={variants}
        selectedVariant={selectedVariant}
        setSelectedVariant={variant => {
          setSelectedVariant(variant);
          if (carouselRef.current) {
            const requiredImage = variant.image?.url;
            const index = productImages.findIndex(productImg => productImg.url === requiredImage);
            if (index >= 0) {
              carouselRef.current.scrollToIndex(index);
            }
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1
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
  }
});

export default AboveThefoldContent;
