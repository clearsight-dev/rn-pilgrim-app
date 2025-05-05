import React, { useEffect, useState } from "react";
import { StyleSheet, SectionList, Platform, Text, View } from "react-native";
import { useApptileWindowDims } from "apptile-core";
import { useRoute } from "@react-navigation/native";
import {
  fetchProductData,
  fetchProductRecommendations,
} from "../../../../extractedQueries/pdpquery";
import AboveThefoldContent from "./AboveThefoldContent";
import DescriptionCard from "./DescriptionCard";
import SelectShade from './shadeSelector'
import RecommendationsRoot from "./recommendations/RecommendationsRoot";
import BenefitsRoot from "./keybenefits/BenefitsRoot";
import BenefitsCard from "./keybenefits/BenefitsCard";
import RatingsReviewsRoot from "./ratingsAndReviews/RatingsReviewsRoot";
import PilgrimCartButton from "../../../../extractedQueries/PilgrimCartButton";
import PilgrimCode from "../../../../extractedQueries/PilgrimCode";
import ExternalLinks from "../../../../extractedQueries/ExternalLinks";
import { addLineItemToCart } from "../../../../extractedQueries/selectors";
import {
  formatProduct,
  formatProductsForCarousel,
} from "../../../../extractedQueries/RelatedProductsCarousel";
import { fetchProductOptions } from "../../../../extractedQueries/collectionqueries";
import FAQComponent from "./FAQComponent";
import ImageBand from "./keybenefits/ImageBand";
import { colors, FONT_FAMILY } from "../../../../extractedQueries/theme";
import Accordion from "../../../../extractedQueries/Accordion";

async function getVariants(product, setVariants, setSelectedVariant) {
  const res = await fetchProductOptions(product.handle, product.variantsCount);
  const options = res?.options ?? [];
  const variants = res?.variants ?? [];
  const option = options[0];

  if (!option) return;

  let processedVariants = [];
  for (let index = 0; index < option.optionValues.length; ++index) {
    const value = option.optionValues[index];
    const variant = variants.find((it) => {
      return it?.node?.selectedOptions?.[0]?.value === value.name;
    });

    if (variant) {
      processedVariants.push(variant.node);
    }
  }

  setVariants(processedVariants);
  setSelectedVariant(processedVariants[0]);
}

async function getProductRecommendations(productByHandle, setProductData) {
  if (productByHandle?.handle) {
    const result = await fetchProductRecommendations(productByHandle?.handle);

    let complementaryRecommendation = null;
    if (result.complementaryRecommendations.length > 0) {
      complementaryRecommendation = formatProduct(
        result.complementaryRecommendations[0]
      );
    }

    const relatedRecommendations = formatProductsForCarousel(
      result.relatedRecommendations
    );
    setProductData((prev) => {
      return {
        ...prev,
        relatedRecommendations,
        complementaryRecommendation,
      };
    });
  } else {
    console.error(
      "Could not get recommendations as product handle was not provided"
    );
  }
}

export function ReactComponent({ model }) {
  const route = useRoute();
  const productHandle =
    route.params?.productHandle ?? "3-redensyl-4-anagain-hair-growth-serum";
  // const productHandle = model.get('productHandle');
  const backgroundColor = model.get("backgroundColor") || "#C5FAFF4D";
  const cardWidthPercentage = parseFloat(
    model.get("cardWidthPercentage") || "70"
  );
  const cardSpacing = parseInt(model.get("cardSpacing") || "10", 10);

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();

  useEffect(() => {
    // When this function runs react's render cycle for the entire
    // PDP page will get kicked off. So its isolated and called differently
    // on android and ios to allow the pdp screen transition to not be blocked
    // by the react render cycle.
    function startHeavyRendering(timeout, result) {
      clearTimeout(timeout);
      const productByHandle = formatProduct(result.productByHandle);

      setProductData((prev) => {
        return {
          ...prev,
          productByHandle,
        };
      });
      setLoading(false);
      getVariants(productByHandle, setVariants, setSelectedVariant);
      // setTimeout(() => {
      //   getProductRecommendations(productByHandle, setProductData);
      // }, 500);
    }

    async function loadProductData() {
      const timeout = setTimeout(() => {
        setLoading(true);
      }, 100);

      try {
        if (!productHandle) {
          // TODO(gaurav): actually retry
          console.error("[APPTILE_AGENT] No product handle.");
          return;
        }

        const result = await fetchProductData(productHandle);

        if (Platform.OS === "android") {
          setTimeout(() => {
            startHeavyRendering(timeout, result);
          }, 50);
        } else {
          startHeavyRendering(timeout, result);
        }
      } catch (err) {
        console.error("[APPTILE_AGENT] Error fetching product data:", err);
        setError(err.message || "Failed to fetch product data");
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    if (productHandle) {
      if (Platform.OS === "android") {
        setTimeout(() => {
          loadProductData();
        }, 100);
      } else {
        loadProductData();
      }
    }
  }, [productHandle]);

  // Prepare sections for SectionList
  const sections = [
    // Actual content sections
    {
      title: "Product Information",
      type: "above-the-fold",
      key: "above-the-fold",
      data: [{}],
    },
    {
      title: "Select Shade",
      type: "select-shade",
      key: "select-shade",
      data: [{}],
    },
    {
      title: "Key Benefits",
      type: "benefits",
      key: "benefits",
      data: [{}],
    },
    {
      title: "Product Description",
      type: "description",
      key: "description",
      data: productData?.productByHandle ? [{}] : [],
    },
    {
      title: "Key ingredients",
      type: "ingredients",
      key: "ingredients",
      data: [{}],
    },
    {
      title: "Ratings & Reviews",
      type: "ratings",
      key: "ratings",
      data: [{}],
    },
    // {
    //   title: "Recommended Products",
    //   type: "recommendations",
    //   key: "recommendations",
    //   data: [{}],
    // },
    {
      title: "Pilgrim Code",
      type: "pilgrim-code",
      key: "pilgrim-code",
      data: [{}],
    },
    {
      title: "Additional Information",
      type: "additional-info",
      key: "additional-info",
      data: [{}],
    },
    {
      title: "FAQ",
      type: "faq",
      key: "faq",
      data: [{}],
    },
    {
      title: "External links",
      type: "external-links",
      key: "external-links",
      data: [{}],
    },
  ];

  // Render section headers
  const renderSectionHeader = ({ section }) =>
    null;
    // <View style={styles.sectionHeader}>
    //   <Text style={styles.sectionHeaderText}>{section.title}</Text>
    // </View>

  // Render each section based on its type
  const renderItem = ({ item, section }) => {
    switch (section.type) {
      case "above-the-fold":
        return (
          <AboveThefoldContent
            loading={loading}
            error={error}
            product={productData?.productByHandle}
            variants={variants}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            screenWidth={screenWidth}
          />
        );
      case "description":
        return (
          <DescriptionCard
            productData={productData?.productByHandle}
            loading={loading}
          />
        );
      case "select-shade":
        return (
          <SelectShade
            productData={productData?.productByHandle}
            selectedVariant={selectedVariant}
            variants={variants}
            setSelectedVariant={setSelectedVariant}
          />
        );
      case "benefits":
        return (
          <>
            <BenefitsCard
              title={productData?.productByHandle?.textBenefits?.title}
              benefits={productData?.productByHandle?.textBenefits?.items}
              style={{ marginBottom: 16 }}
            />
            {productData?.productByHandle?.benefitsImages?.length > 0 && (
              <BenefitsRoot
                loading={loading}
                error={error}
                backgroundColor={backgroundColor}
                cardWidthPercentage={cardWidthPercentage}
                cardSpacing={cardSpacing}
                images={productData?.productByHandle?.benefitsImages}
                title="Key Benefits"
              />
            )}
          </>
        );
      case "ingredients":
        return (
          <>
            {productData?.productByHandle?.ingredients?.length > 0 && (
              <BenefitsRoot
                loading={loading}
                error={error}
                backgroundColor={backgroundColor}
                cardWidthPercentage={cardWidthPercentage}
                cardSpacing={cardSpacing}
                images={productData?.productByHandle?.ingredients}
                title="Key ingredients"
              />
            )}
            <ImageBand />
          </>
        );
      case "ratings":
        return <RatingsReviewsRoot product={productData?.productByHandle} />;
      case "recommendations":
        return (
          <RecommendationsRoot
            loading={loading}
            error={error}
            data={productData}
            handleAddToCart={() => console.log("adding to cart")}
          />
        );
      case "pilgrim-code":
        return (
          <Accordion title={"The Pilgrim Code"}>
            <PilgrimCode enableCodeText/>
          </Accordion>
        );
      case "additional-info":
        return (
          <Accordion title={"Additional Information"}>
            <Text style={styles.additionalInfoTxt}>
            Marketed in India by: Heavenly Secrets Pvt. Ltd., 74 Technopark, MIDC, Andheri (E), Mumbai, India - 400093
            Manufactured by: Naturis Cosmetics Pvt. Ltd, 1-EPIP, SIDCO Industrial Complex, Bari Brahmana, Jammu (J&K), India - 181133
            </Text>
          </Accordion>
        );
      case "faq":
        return <FAQComponent product={productData?.productByHandle} />;
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        width: screenWidth,
        flex: 1,
        position: "relative",
      }}
    >
      <SectionList
        style={[styles.container, { height: screenHeight }]}
        contentContainerStyle={styles.contentContainer}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => index.toString()}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={true}
        initialNumToRender={2} // Start with fewer sections for faster initial render
        maxToRenderPerBatch={4} // Render fewer items per batch
        windowSize={5} // Reduce window size for better performance
        removeClippedSubviews={true} // Important for performance
      />
      <PilgrimCartButton
        containerStyle={{
          padding: 16,
          paddingHorizontal: 24,
          position: "absolute",
          bottom: 0,
          backgroundColor: "white",
          width: "100%",
        }}
        buttonText={"Add to Cart"}
        variant="large"
        onPress={() => addLineItemToCart(selectedVariant.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 70,
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    backgroundColor: colors.dark5,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "600",
    color: colors.dark90,
  },
  dummySection: {
    padding: 20,
    backgroundColor: colors.dark5,
    marginVertical: 10,
    borderRadius: 8,
  },
  dummyText: {
    fontSize: 14,
    color: colors.dark70,
    textAlign: "center",
  },
  additionalInfoTxt:{
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: "#313131",

  }
});

export const WidgetConfig = {
  productHandle: "",
};

export const WidgetEditors = {
  basic: [
    {
      type: "codeInput",
      name: "productHandle",
      props: {
        label: "Product Handle",
      },
    },
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: "Product Detail Page",
  defaultProps: {
    backgroundColor: {
      label: "Background Color",
      defaultValue: "#C5FAFF4D",
    },
    cardWidthPercentage: {
      label: "Card Width (% of screen)",
      defaultValue: "70",
    },
    cardSpacing: {
      label: "Spacing Between Cards",
      defaultValue: "20",
    },
  },
};
