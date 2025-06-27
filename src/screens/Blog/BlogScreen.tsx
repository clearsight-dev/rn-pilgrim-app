import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import RenderHtml, {defaultSystemFonts} from 'react-native-render-html';
import {fetchBlogArticle} from '../../queries/graphql/blog/blog';
import {useWindowDimensions} from 'react-native';
import {colors, FONT_FAMILY} from '../../../extractedQueries/theme';
import RelatedProductsCarousel, {
  formatProduct,
} from '../../../extractedQueries/RelatedProductsCarousel';
import ShadeSelector from '../../../extractedQueries/ShadeSelector';
import VariantSelector from '../../../extractedQueries/VariantSelector';
import {Image} from '../../../extractedQueries/ImageComponent';
import {useRoute} from '@react-navigation/native';

const RTSystemFonts = [
  ...defaultSystemFonts,
  FONT_FAMILY.bold,
  FONT_FAMILY.medium,
  FONT_FAMILY.regular,
];

const RTBaseStyle = {
  fontFamily: FONT_FAMILY.regular,
  fontSize: 16,
  lineHeight: 16 * 1.5,
  color: colors.dark90,
};

export default function BlogArticleScreen() {
  const {width} = useWindowDimensions();
  const route = useRoute();
  const blogHandle = route.params?.blogHandle;
  const articleHandle = route.params?.articleHandle;

  const shadeBottomSheetRef = useRef(null);
  const variantBottomSheetRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!blogHandle || !articleHandle) {
      setLoading(false);
      return;
    }

    async function loadBlog() {
      try {
        const {data} = await fetchBlogArticle({blogHandle, articleHandle});
        setArticle(data);
      } catch (err) {
        console.error('Failed to load article', err);
      } finally {
        setLoading(false);
      }
    }

    loadBlog();
  }, [blogHandle, articleHandle]);

  if (!blogHandle || !articleHandle) {
    return (
      <View style={styles.error}>
        <Text style={styles.text}>Invalid article parameters.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.error}>
        <Text style={styles.text}>Article not found</Text>
      </View>
    );
  }

  const {title, excerptHtml, contentHtml, metafield, image} = article;
  const products = metafield?.reference?.products?.nodes || [];
  const collectionTitle = metafield?.reference?.title || 'Related Products';
  const formattedProducts = products.map(formatProduct);

  const onSelectShade = product => {
    setSelectedProduct(product);
    shadeBottomSheetRef.current?.show();
  };

  const onSelectVariant = product => {
    setSelectedProduct(product);
    variantBottomSheetRef.current?.show();
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff', marginTop: 55}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 16}}
        showsVerticalScrollIndicator={false}>
        {/* Blog Image */}
        {image?.url && (
          <View style={{marginBottom: 16}}>
            <Image
              source={{uri: image.url}}
              style={{
                width: width,
                height: (width * image.height) / image.width,
              }}
              resizeMode="cover"
              accessibilityLabel={image.altText || 'Blog article image'}
            />
          </View>
        )}

        <View style={{flex: 1, padding: 16}}>
          {/* Blog Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Excerpt */}
          {excerptHtml && (
            <RenderHtml
              contentWidth={width}
              systemFonts={RTSystemFonts}
              baseStyle={RTBaseStyle}
              source={{html: excerptHtml}}
            />
          )}

          {/* Main Content */}
          {contentHtml && (
            <RenderHtml
              contentWidth={width}
              systemFonts={RTSystemFonts}
              baseStyle={RTBaseStyle}
              source={{html: contentHtml}}
            />
          )}
        </View>

        {/* Related Products Carousel */}
        {formattedProducts.length > 0 && (
          <RelatedProductsCarousel
            title={collectionTitle}
            products={formattedProducts}
            style={styles.carousel}
            onSelectShade={onSelectShade}
            onSelectVariant={onSelectVariant}
          />
        )}
      </ScrollView>

      {/* Bottom Sheets */}
      <ShadeSelector
        bottomSheetRef={shadeBottomSheetRef}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <VariantSelector
        bottomSheetRef={variantBottomSheetRef}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 55,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 55,
  },
  title: {
    fontSize: 24,
    color: colors.dark90,
    marginBottom: 16,
    fontFamily: FONT_FAMILY.bold,
  },
  comingSoon: {
    marginTop: 20,
    color: colors.dark70,
    fontStyle: 'italic',
    fontFamily: FONT_FAMILY.regular,
  },
  carousel: {
    marginTop: 24,
  },
  text: {
    fontSize: 24,
    color: colors.dark90,
    marginBottom: 16,
    fontFamily: FONT_FAMILY.bold,
  },
});
