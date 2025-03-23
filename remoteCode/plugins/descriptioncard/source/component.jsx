
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Portal } from '@gorhom/portal';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApptileWindowDims } from 'apptile-core';
import { datasourceTypeModelSel } from 'apptile-core';
import { useSelector } from 'react-redux';
import {fetchProductData} from '../../../../extractedQueries/pdpquery';

export function ReactComponent({ model }) {
  const [activeTab, setActiveTab] = useState('description');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetIsRendered, setSheetIsRendered] = useState(false);
  const { width: screenWidth, height: screenHeight } = useApptileWindowDims();
  const sheetVisibility = useRef(new Animated.Value(0)).current;
  const productHandle = model.get('productHandle');
  
  // Get shopify query runner
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  
  // Fetch product data
  useEffect(() => {
    const loadData = async () => {
      try {
        const queryRunner = shopifyDSModel?.get('queryRunner');
        if (!queryRunner || !productHandle) {
          console.error("[APPTILE_AGENT] No query runner available");
          return;
        }
        
        const result = await fetchProductData(queryRunner, productHandle);
        setProductData(result.data.productByHandle);
      } catch (error) {
        console.error("[APPTILE_AGENT] Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (shopifyDSModel) {
      loadData();
    }
  }, [shopifyDSModel, productHandle]);
  
  const openModal = () => {
    console.log("[APPTILE_AGENT] Opening modal");
    setSheetIsRendered(true);
    // Allow a brief moment for the sheet to be rendered before animating
    setTimeout(() => {
      Animated.timing(sheetVisibility, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }, 50);
  };
  
  const closeModal = () => {
    Animated.timing(sheetVisibility, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        setSheetIsRendered(false);
      }, 50);
    });
  };
  
  // Find the how_to_use metafield
  const howToUseMetafield = productData?.metafields?.find(
    meta => meta.key === 'how_to_use' && meta.namespace === 'my_fields'
  );
  
  const howToUseContent = howToUseMetafield?.value || "No usage instructions available.";
  
  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading product details...</Text>
      </View>
    );
  }
  
  // Create HTML content wrapper for How to Use
  const howToUseHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 0;
            margin: 0;
            color: #333;
            line-height: 1.5;
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${howToUseContent}
      </body>
    </html>
  `;
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product Details</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'description' && styles.activeTab]}
          onPress={() => setActiveTab('description')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'description' && styles.activeTabText
            ]}
          >
            Description
          </Text>
          {activeTab === 'description' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'howToUse' && styles.activeTab]}
          onPress={() => setActiveTab('howToUse')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'howToUse' && styles.activeTabText
            ]}
          >
            How to use
          </Text>
          {activeTab === 'howToUse' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        {activeTab === 'description' ? (
          <View>
            <Text style={styles.suitableFor}>Suitable for: All Hair Types</Text>
            
            <Text style={styles.title}>
              Bestselling Hair Growth Serum for Thicker, Fuller Hair in 28 Days
            </Text>
            
            <Text style={styles.description}>
              Based on a clinical study conducted on 32 males & females presenting hair loss; when used as a regime
            </Text>
            
            <TouchableOpacity onPress={openModal} style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read more </Text>
              <Text style={styles.readMoreArrow}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.howToUseContainer}>
            {Platform.OS === 'web' ? (
              <iframe 
                srcDoc={howToUseHtml}
                style={styles.howToUseIframe}
              />
            ) : (
              <WebView
                source={{ html: howToUseHtml }}
                style={styles.howToUseWebView}
                scrollEnabled={true}
              />
            )}
          </View>
        )}
      </View>
      
      {sheetIsRendered && productData && (
        <Portal hostName="root">
          <GestureHandlerRootView style={styles.modalOverlay}>
            <Pressable 
              style={styles.modalBackdrop}
              onPress={closeModal}
            />
            <Animated.View
              style={[
                styles.sheetContainer,
                {
                  transform: [
                    {
                      translateY: sheetVisibility.interpolate({
                        inputRange: [0, 1],
                        outputRange: [screenHeight, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Full Description</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {Platform.OS === 'web' ? (
                <iframe 
                  srcDoc={`
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            padding: 16px;
                            color: #333;
                            line-height: 1.5;
                          }
                          img { max-width: 100%; height: auto; }
                        </style>
                      </head>
                      <body>
                        ${productData.descriptionHtml}
                      </body>
                    </html>
                  `}
                  style={styles.iframe}
                />
              ) : (
                <WebView
                  source={{ 
                    html: `
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <style>
                            body { 
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                              padding: 16px;
                              color: #333;
                              line-height: 1.5;
                            }
                            img { max-width: 100%; height: auto; }
                          </style>
                        </head>
                        <body>
                          ${productData.descriptionHtml}
                        </body>
                      </html>
                    `
                  }}
                  style={styles.webView}
                />
              )}
            </Animated.View>
          </GestureHandlerRootView>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  activeTabText: {
    color: '#4EB0B5',
    fontWeight: '500',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#4EB0B5',
    borderRadius: 1.5,
  },
  contentContainer: {
    paddingVertical: 12,
  },
  suitableFor: {
    fontSize: 15,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    color: '#4EB0B5',
    fontSize: 16,
  },
  readMoreArrow: {
    color: '#4EB0B5',
    fontSize: 20,
  },
  howToUseContainer: {
    height: 250,
    width: '100%',
  },
  howToUseWebView: {
    flex: 1,
    height: 250,
  },
  howToUseIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  modalOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  modalBackdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  webView: {
    flex: 1,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  }
});

export const WidgetConfig = {
  productHandle: '',
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'productHandle',
      props: {
        label: 'Product Handle'
      }
    }
  ]
};

export const WrapperTileConfig = {
  name: "Product Details Tabs",
  defaultProps: {
    productHandle: {
      label: "Product Handle",
      defaultValue: "hair-growth-serum",
    }
  },
};

export const PropertySettings = {};
