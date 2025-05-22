import React from "react";
import { Carousel } from '../../../../extractedQueries/ImageCarousel';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from "../../../../extractedQueries/ImageComponent";
import { typography } from "../../../../extractedQueries/theme";
import { SkeletonBanner } from "../../../../components/skeleton/imageCarousel"

// MetafieldBannerCarouselSkeleton.tsx  

/**
 * Banner Carousel Section Schema
 * 
 * This schema defines the structure for a banner carousel section in the SectionList.
 * It configures a carousel of banner images that can navigate to collections or products.
 * 
 * @typedef {Object} BannerCarouselSection
 * @property {Object} config - Configuration object for the carousel
 * @property {string} [config.title] - Optional title to display above the carousel
 * @property {Array<Object>} config.items - Array of items to display in the carousel
 * @property {string} [config.items[].collection] - Optional collection handle for navigation
 * @property {string} [config.items[].product] - Optional product handle for navigation
 * @property {Object} config.items[].image - Image object for the carousel item
 * @property {string} config.items[].image.value - URL of the image
 * @property {Object} [config.layout] - Reserved for layout options (currently unused)
 * @property {Object} [config.styles] - Style configuration for the carousel
 * @property {number} [config.styles.aspectRatio] - Aspect ratio for the images (width/height)
 * 
 * @example
 * {
 *   type: 'banner-carousel',
 *   data: [{}],
 *   config: {
 *     title: 'Featured In',
 *     items: [
 *       {
 *         collection: 'bestsellers',
 *         image: {
 *           value: 'https://example.com/image.jpg',
 *         },
 *       },
 *     ],
 *     styles: {
 *       aspectRatio: 1.7,
 *     }
 *   },
 * }
 */
export function BannerCarousel({ config, screenWidth, onNavigate, loading }) {
  const { items, title, layout } = config;
  const { aspectRatio, itemWidth, margin } = config?.styles || {};
  const { enableScrollBubbles } = layout || {}

  if (loading) {
    return <SkeletonBanner width={screenWidth} />
  }

  const mergedContainerStyle = [styles.container, config?.styles?.container];

  return (
    <View style={mergedContainerStyle}>
      {title && <Text style={{ marginBottom: 12, ...typography.heading19, paddingHorizontal: 16 }}>{title}</Text>}
      <Carousel
        flatlistData={items.map((it, i) => ({
          id: i,
          ...it,
          url: it.image?.value,
        }))}
        scrollBubbleEnabled={enableScrollBubbles}
        width={screenWidth}
        renderChildren={({ item }) => {
          return (
            <Pressable
              onPress={() => {
                if (item.collection) {
                  onNavigate('Collection', { collectionHandle: item.collection });
                } else if (item.product) {
                  onNavigate('Product', { productHandle: item.product });
                }
              }}
              style={{ position: 'relative' }}
            >
              <Image
                source={{ uri: item.url || item.urls[Math.floor(item.urls.length / 2)] }}
                resizeMode="contain"
                style={{
                  width: itemWidth || screenWidth,
                  aspectRatio: aspectRatio,
                  margin: margin || 0
                }}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export function MetafieldBannerCarousel({ loading, items, screenWidth, onNavigate, config }) {
  if (loading) {
    return <SkeletonBanner width={screenWidth} />
  }

  const mergedContainerStyle = [styles.container, config?.styles?.container];

  return (
    <View style={mergedContainerStyle}>
      <Carousel
        flatlistData={items.map((item, i) => ({
          id: i,
          ...item,
          url: item.imageUrl,
        }))}
        width={screenWidth}
        renderChildren={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.isNavigatable && item.navigateToScreen) {
                onNavigate(item.navigateToScreen, item.navigateToScreenParam);
              }
            }}
          >
            <Image
              source={{ uri: item.url }}
              resizeMode="cover"
              style={{
                width: screenWidth,
                aspectRatio: 1.3
              }}
            />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
  },
});
