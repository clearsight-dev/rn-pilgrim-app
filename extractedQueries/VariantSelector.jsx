import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, useApptileWindowDims, Icon } from 'apptile-core';
import BottomSheet from './BottomSheet';
import { fetchProductOptions, fetchVariantBySelectedOptions } from './collectionqueries';
import VariantCard from './VariantCard';

function VariantSelector({ 
  bottomSheetRef, 
  product, 
  onAddToCart,
  optionName
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariantDetails, setSelectedVariantDetails] = useState(null);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const originalBottomSheetRef = useRef(bottomSheetRef);
  const {width: screenWidth} = useApptileWindowDims();

  // Reset state when modal is closed
  useEffect(() => {
    // Store the original ref
    originalBottomSheetRef.current = bottomSheetRef;
    
    // Add a custom hide method that resets state
    const originalHide = bottomSheetRef.current?.hide;
    if (bottomSheetRef.current && originalHide) {
      bottomSheetRef.current.hide = () => {
        // Call the original hide method
        originalHide();
        // Reset state
        setSelectedVariant(null);
        setSelectedVariantDetails(null);
        setSelectedVariantId(null);
      };
    }
    
    // Cleanup function to restore original hide method
    return () => {
      if (bottomSheetRef.current && originalBottomSheetRef.current) {
        bottomSheetRef.current.hide = originalBottomSheetRef.current.hide;
      }
    };
  }, [bottomSheetRef]);

  // Process product options to get variant data
  useEffect(() => {
    if (!product) return;

    async function getVariants() {
      const res = await fetchProductOptions(product.handle);
      const options = res?.data?.options ?? [];

      // Find the specified option (not color)
      const option = options?.find(option => 
        option.name.toLowerCase() === optionName.toLowerCase()
      );
      
      if (!option) return;

      const normalizeOption = (value) => {
        return value?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Process each variant value
      const processedVariants = option.optionValues.map((value, index) => {
        // Normalize the variant name
        const normalizedName = normalizeOption(value.name);
        
        // Find matching variant
        const variant = product.variants[0];
        
        return {
          id: index.toString(),
          name: value.name,
          normalizedName,
          price: variant?.price?.amount || "",
          originalPrice: variant?.compareAtPrice?.amount || "",
          discount: (variant?.compareAtPrice?.amount !== variant.price.amount) ? 
            Math.round((1 - (variant.price.amount / variant.compareAtPrice.amount)) * 100) + "% " : null,
          variantId: variant?.id,
          image: variant?.image?.url || product.featuredImage?.url
        };
      });
      
      setVariants(processedVariants);
      
      // Select the first variant by default when product changes
      if (Array.isArray(product.variants[0]?.selectedOptions)) {
        const selectedOption = product.variants[0].selectedOptions[0];
        const selectedVariantIndex = processedVariants.findIndex(it => it.name === selectedOption.value);
        if (selectedVariantIndex >= 0) {
          setSelectedVariant(processedVariants[selectedVariantIndex]);
        }
      }
    }

    getVariants();
  }, [product, optionName]);

  // Fetch variant details when a variant is selected
  useEffect(() => {
    if (!selectedVariant || !product) return;
    
    const fetchVariantDetails = async () => {
      // Only show loading after 200ms to avoid flicker for cached data
      const loadingTimer = setTimeout(() => {
        setLoadingVariant(true);
      }, 200);
      
      try {
        const selectedOptions = [{
          name: optionName,
          value: selectedVariant.name
        }];
        
        const result = await fetchVariantBySelectedOptions(
          product.handle,
          selectedOptions
        );
        
        const variant = result.data.variant;
        if (variant) {
          setSelectedVariantDetails(variant);
          setSelectedVariantId(variant.id);
        } else {
          // Fallback to the variant ID we already have
          setSelectedVariantId(selectedVariant.variantId || product.firstVariantId);
        }
      } catch (error) {
        console.error('Error fetching variant details:', error);
        // Fallback to the variant ID we already have
        setSelectedVariantId(selectedVariant.variantId || product.firstVariantId);
      } finally {
        clearTimeout(loadingTimer);
        setLoadingVariant(false);
      }
    };
    
    fetchVariantDetails();
  }, [selectedVariant, product, optionName]);

  const handleAddToCart = () => {
    if (selectedVariantId && onAddToCart) {
      onAddToCart(selectedVariantId);
      // Don't hide the modal or reset the selection
    }
  };

  // Render a variant item
  const renderVariantItem = ({ item, index }) => (
    <Pressable 
      style={styles.variantItem}
      onPress={() => setSelectedVariant(item)}
    >
      <VariantCard
        variant={item}
        optionName={optionName}
        isSelected={selectedVariant?.id === item.id}
        isPopular={index === 0} // First item is always popular choice
        onSelect={() => setSelectedVariant(item)}
      />
    </Pressable>
  );

  return (
    <BottomSheet 
      ref={bottomSheetRef}
      title={`Select ${optionName}`}
      sheetHeight={0.8} // 80% of screen height
    >
      {product && (
        <View style={styles.bottomSheetContent}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            {loadingVariant ? (
              <View style={[
                styles.loadingContainer,
                {minHeight: screenWidth / 2.1}
              ]}>
                <ActivityIndicator size="small" color="#00909E" />
              </View>
            ) : (
              <>
                <Image 
                  source={{ uri: selectedVariantDetails?.image?.url || selectedVariant?.image || product.featuredImage?.url }} 
                  style={[
                    styles.productImage,
                    {
                      height: screenWidth / 2.1
                    }
                  ]}
                  resizeMode="contain"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₹{parseInt(selectedVariantDetails?.price?.amount || "0").toLocaleString()}
                  </Text>
                  {selectedVariantDetails?.weight > 0 && (
                    <Text style={styles.productWeight}>
                      {selectedVariantDetails.weight} {selectedVariantDetails.weightUnit.toLowerCase()}
                    </Text>
                  )}
                  <Text style={styles.productWeight}>
                    {optionName}: {selectedVariantDetails?.title || selectedVariant?.name}
                  </Text>
                </View>
              </>
            )}
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Variant Selection */}
          <FlatList
            data={variants}
            renderItem={renderVariantItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.variantGrid}
            showsVerticalScrollIndicator={true}
            style={styles.flatListContainer}
          />
          
          {/* Add to Cart Button */}
          <Pressable 
            style={[
              styles.addToCartButton,
              !selectedVariant && styles.addToCartButtonDisabled
            ]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>
              {selectedVariant ? "Add to Cart" : `Select a ${optionName}`}
            </Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    padding: 16,
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    aspectRatio: 1,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 14,
    color: '#666666',
  },
  loadingContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  flatListContainer: {
    flex: 1,
  },
  variantGrid: {
    paddingBottom: 16,
  },
  variantItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: '#FACA0C',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  }
});

export default VariantSelector;
