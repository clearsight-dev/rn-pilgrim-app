import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import PilgrimCartButton from './PilgrimCartButton';
import {Image} from './ImageComponent';
import {navigateToScreen} from 'apptile-core';
import {useDispatch} from 'react-redux';
import Star from './Star';
import ProductFlag from './ProductFlag';
import {addLineItemToCart} from './selectors';

function RelatedProductCard({product, style, cardVariant, onSelectShade, onSelectVariant}) {
  const {
    handle,
    title,
    featuredImage,
    price,
    compareAtPrice,
    rating,
    productType,
    variantsCount,
    productLabel1,
    productLabel2,
    weight,
    weightUnit,
  } = product;

  // Calculate discount percentage if compareAtPrice exists
  let discountPercentage = compareAtPrice?.amount
    ? Math.round(((compareAtPrice.amount - price.amount) / compareAtPrice.amount) * 100)
    : 0;
  if (isNaN(discountPercentage)) {
    discountPercentage = 0;
  }

  let weightString = "";
  if (weight && weightUnit && weightUnit.toString) {
    weightString = `${weight}${weightUnit.toString().toLowerCase()}`;
  }

  let isBestSeller = false;
  if (productLabel1?.value?.toString().toLowerCase().includes("bestseller")) {
    isBestSeller = true;
  }

  const dispatch = useDispatch();

  // Find the first non-color option for variant selection
  let variantOptionName = 'Shade';
  if (product.options && product.options.length > 0) {
    const nonColorOption = product.options.find(option => 
      option.name.toLowerCase() !== 'color'
    );
    if (nonColorOption) {
      variantOptionName = nonColorOption.name;
    }
  }

  // Determine the CTA button text and action
  const isSelectShade = variantsCount > 1 && productType.startsWith('Makeup');
  const isChooseVariant =
    variantsCount > 1 && !productType.startsWith('Makeup');
  const buttonText = isSelectShade
    ? 'Select Shade'
    : isChooseVariant
    ? 'Choose Variant'
    : 'Add to Cart';

  const handleButtonPress = (e) => {
    if (isSelectShade && onSelectShade) {
      return onSelectShade(product);
    } else if (isChooseVariant && onSelectVariant) {
      return onSelectVariant(product);
    } else {
      return addLineItemToCart(product.firstVariantId);
    }
  };

  return (
    <Pressable
      style={({pressed}) => [
        styles.container, 
        pressed && {opacity: 0.4},
        style
      ]}
      onPress={() => {
        dispatch(navigateToScreen('Product', {productHandle: handle}));
      }
    }>
      {/* Promo Tag */}
      {productLabel2?.value && <ProductFlag
        label={productLabel2?.value}
        color="#00726C"
        style={styles.promoTagContainer}
        textStyle={styles.promoTagText}
        height={18}
        width={95}
      />}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: featuredImage?.url}}
          style={styles.image}
          resizeMode="contain"
        />
        {(rating > 0) && (<View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating}</Text>
          <Star color={'#00909E'} size={12} fillPercentage={1} />
        </View>)}
      </View> 

      {/* Product Details */}
      <View style={[styles.detailsContainer, cardVariant === "large" ? {alignItems: "center"} : {}]}>
        {
          isBestSeller && (
            <Text style={{color: '#F27B58', fontWeight: '600', fontSize: 11}}>
              BESTSELLER
            </Text>
          )
      }
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{weightString}</Text>

        {/* Price Section */}
        <View style={{flexGrow: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{parseInt(price.amount).toLocaleString()}</Text>

            {(compareAtPrice && discountPercentage > 0) && (
              <>
                <Text style={styles.compareAtPrice}>
                  ₹{parseInt(compareAtPrice).toLocaleString()}
                </Text>
                <Text style={styles.discount}>{discountPercentage}% Off</Text>
              </>
            )}
          </View>
        </View>
      </View>
      <PilgrimCartButton
        buttonText={buttonText}
        onPress={handleButtonPress}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 184,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 12,
  },
  promoTagContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    zIndex: 1,
  },
  promoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 24,
    borderColor: '#F3F3F3',
    backgroundColor: 'white',
  },
  ratingText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '600',
    marginRight: 4,
  },
  detailsContainer: {
    flexGrow: 1,
    fontSize: 12,
    color: '#767676',
    fontWeight: '400',
    padding: 12,
    paddingTop: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginRight: 4,
  },
  compareAtPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  discount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00909E',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default memo(RelatedProductCard);
