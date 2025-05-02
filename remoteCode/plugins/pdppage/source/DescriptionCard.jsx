import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import BottomSheet from "../../../../extractedQueries/BottomSheet";
import { fetchProductDescriptionHtml } from "../../../../extractedQueries/pdpquery";
import {
  colors,
  FONT_FAMILY,
  typography,
} from "../../../../extractedQueries/theme";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { useWindowDimensions } from "react-native";

const RTSystemFonts = [
  ...defaultSystemFonts,
  FONT_FAMILY.bold,
  FONT_FAMILY.medium,
  FONT_FAMILY.regular,
];

const RTBaseStyle = {
  fontFamily: FONT_FAMILY.regular,
  fontSize: 14,
  color: colors.dark90,
};

const RTTagsStyles = {
  b: {
    fontFamily: FONT_FAMILY.bold,
  },
  p: {
    lineHeight: 14 * 1.5,
  },
  li: {
    marginBottom: 8,
  },
};

const DescriptionCard = ({ productData, loading }) => {
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState("description");
  const bottomSheetRef = useRef(null);
  const [description, setDescription] = useState({
    status: "notstarted",
    valueHtml: "",
    valueText: "",
  });

  const howToUseContent =
    productData?.howToUse || "No usage instructions available.";

  useEffect(() => {
    if (!productData?.handle) {
      return;
    }

    const timeout = setTimeout(() => {
      setDescription((prev) => ({
        ...prev,
        status: "loading",
      }));
    }, 100);

    fetchProductDescriptionHtml(productData.handle)
      .then(({ valueHtml, valueText }) => {
        setDescription({
          status: "loaded",
          valueHtml,
          valueText,
        });
        clearTimeout(timeout);
      })
      .catch((err) => {
        clearTimeout(timeout);
        setDescription((value) => ({
          ...value,
          status: "error",
        }));

        console.error("Error when fetching html: ", err);
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return () => {
      clearTimeout(timeout);
    };
  }, [productData?.handle]);

  // Render loading state
  if (loading || description.status != "loaded") {
    return (
      <View style={styles.container}>
        <Text style={typography.body14}>Loading product details...</Text>
      </View>
    );
  }

  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.show();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.family, styles.header]}>Product Details</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "description" && styles.activeTab]}
          onPress={() => setActiveTab("description")}
        >
          <Text
            style={[
              typography.family,
              styles.tabText,
              activeTab === "description" && styles.activeTabText,
            ]}
          >
            Description
          </Text>
          {activeTab === "description" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "howToUse" && styles.activeTab]}
          onPress={() => setActiveTab("howToUse")}
        >
          <Text
            style={[
              typography.family,
              styles.tabText,
              activeTab === "howToUse" && styles.activeTabText,
            ]}
          >
            How to use
          </Text>
          {activeTab === "howToUse" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === "description" ? (
          <View>
            <RenderHtml
              systemFonts={RTSystemFonts}
              contentWidth={width}
              baseStyle={RTBaseStyle}
              tagsStyles={RTTagsStyles}
              source={{
                html: `${description?.valueHtml?.substring(0, 300)}...`,
              }}
            />
            <TouchableOpacity
              onPress={openBottomSheet}
              style={styles.readMoreButton}
            >
              <Text style={[typography.family, styles.readMoreText]}>
                Read more{" "}
              </Text>
              <Text style={[typography.family, styles.readMoreArrow]}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.howToUseContainer}>
            <RenderHtml
              systemFonts={RTSystemFonts}
              contentWidth={width}
              baseStyle={RTBaseStyle}
              tagsStyles={RTTagsStyles}
              source={{
                html: howToUseContent,
              }}
            />
          </View>
        )}
      </View>

      {productData && (
        <BottomSheet
          ref={bottomSheetRef}
          title="Full Description"
          sheetHeightFraction={0.7}
        >
          <ScrollView contentContainerStyle={{ marginHorizontal: 16 }}>
            <RenderHtml
              systemFonts={RTSystemFonts}
              contentWidth={width}
              baseStyle={{ ...RTBaseStyle }}
              tagsStyles={RTTagsStyles}
              source={{
                html: description.valueHtml,
              }}
            />
          </ScrollView>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 16,
    width: "100%",
    minHeight: 100,
  },
  header: {
    fontSize: 19,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark20,
    marginBottom: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    position: "relative",
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: colors.dark50,
  },
  activeTabText: {
    color: colors.primaryMain,
    fontFamily: FONT_FAMILY.medium,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primaryMain,
    borderRadius: 1.5,
  },
  contentContainer: {},
  suitableFor: {
    fontSize: 15,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.dark90,
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMoreText: {
    color: colors.secondaryMain,
    fontSize: 16,
  },
  readMoreArrow: {
    color: colors.secondaryMain,
    fontSize: 20,
  },
  howToUseContainer: {},
  howToUseWebView: {
    flex: 1,
    height: 100,
  },
  howToUseIframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  webView: {
    flex: 1,
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
});

export default DescriptionCard;
