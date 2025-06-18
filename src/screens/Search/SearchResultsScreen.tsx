import React, { useState, useEffect, useRef } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";

import { fetchSearchProducts } from "../../queries/graphql/search/search";
import { RelatedProductCardSkeleton } from "../../../components/skeleton/productCard";
import RelatedProductCard from "../../../extractedQueries/RelatedProductCard";
import { formatProduct } from "../../../extractedQueries/RelatedProductsCarousel";
import ShadeSelector from "../../../extractedQueries/ShadeSelector";
import VariantSelector from "../../../extractedQueries/VariantSelector";
import { colors, typography } from "../../../extractedQueries/theme";

import { SearchBar } from "./SearchScreen";

const SearchScreen = () => {
  const route = useRoute();
  const searchQuery = route.params?.query ?? "makeup";

  const [products, setProducts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastCursor, setLastCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const shadeBottomSheetRef = useRef(null);
  const variantBottomSheetRef = useRef(null);
  const flatListRef = useRef(null);
  const fetchedCursors = useRef(new Set());

  const loadProducts = async (cursor = null, append = false) => {
    if (cursor && loadingMore) return;

    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const response = await fetchSearchProducts({
        query: searchQuery,
        first: 20,
        after: cursor,
        sortKey: "RELEVANCE",
        reverse: false,
        types: ["PRODUCT"],
        unavailableProducts: "SHOW",
      });

      const rawProducts = response?.data?.products ?? [];
      const formattedProducts = rawProducts.map(formatProduct);

      if (append) {
        setProducts((prev) => [...prev, ...formattedProducts]);
      } else {
        setProducts(formattedProducts);
      }

      setHasNextPage(response?.data?.pagination?.hasNextPage ?? false);
      setLastCursor(response?.data?.pagination?.endCursor ?? null);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      if (cursor) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchedCursors.current.clear();
    loadProducts();
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (hasNextPage && !loading && !loadingMore) {
      //!Fix me: Check if the current cursor has already been fetched <== this is not a good way to do this, but it works for now
      if (fetchedCursors.current.has(lastCursor)) {
        console.log(
          "[SKIPPED] Already fetched cursor:",
          lastCursor,
          fetchedCursors.current
        );
        return;
      }

      fetchedCursors.current.add(lastCursor);

      loadProducts(lastCursor, true);
    }
  };

  const onSelectShade = (product) => {
    setSelectedProduct(product);
    shadeBottomSheetRef.current?.show();
  };

  // Handle Choose Variant button click
  const onSelectVariant = (product) => {
    setSelectedProduct(product);
    variantBottomSheetRef.current?.show();
  };

  const renderProductItem = ({ item }) => {
    if (loading) return <RelatedProductCardSkeleton />;
    return (
      <RelatedProductCard
        product={item}
        style={styles.productCard}
        onSelectShade={onSelectShade}
        onSelectVariant={onSelectVariant}
        cardVariant="Regular"
      />
    );
  };

  const dummyData = Array(12)
    .fill()
    .map((_, index) => ({ id: `dummy-${index}` }));

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.secondaryMain} />
        <Text style={[typography.family, styles.loadingMoreText]}>
          Loading more products...
        </Text>
      </View>
    );
  };

  // inside the component
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <SearchBar
        isEditable={false}
        inputValue={searchQuery}
        setInputValue={() => {}}
      />
      <FlatList
        ref={flatListRef}
        data={loading ? dummyData : products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={1.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <Text style={[typography.family, styles.emptyText]}>
            No products found
          </Text>
        }
      />

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
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  gridContainer: {
    paddingBottom: 80,
    paddingTop: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  productCard: {
    width: "48%",
    marginBottom: 16,
  },
  loadingMoreText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 32,
    color: colors.dark70,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: Platform.OS === "android" ? 20 : 0,
  },
  backButton: {
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingRight: 8,
  },
  iconRight: {
    paddingLeft: 8,
  },
});
