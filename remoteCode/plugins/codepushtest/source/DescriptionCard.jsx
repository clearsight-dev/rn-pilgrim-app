import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomSheet from '../../../../extractedQueries/BottomSheet';

const DescriptionCard = ({ productData, loading }) => {
  const [activeTab, setActiveTab] = useState('description');
  const bottomSheetRef = useRef(null);
  
  // Find the how_to_use metafield
  const howToUseMetafield = productData?.metafields?.find(
    meta => meta?.key === 'how_to_use' && meta?.namespace === 'my_fields'
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

  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.show();
    }
  };
  
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
            
            <TouchableOpacity onPress={openBottomSheet} style={styles.readMoreButton}>
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
      
      {productData && (
        <BottomSheet 
          ref={bottomSheetRef}
          title="Full Description"
          sheetHeightFraction={0.7}
        >
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
        </BottomSheet>
      )}
    </View>
  );
};

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
  webView: {
    flex: 1,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  }
});

export default DescriptionCard;
