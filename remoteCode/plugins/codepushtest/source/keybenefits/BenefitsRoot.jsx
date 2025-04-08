import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text as RNText } from 'react-native';
import {Image} from '../../../../../extractedQueries/ImageComponent';
import { useApptileWindowDims } from 'apptile-core';
import BenefitsCard from './BenefitsCard';
import ThreeDCarousel from './ThreeDCarousel';
import GradientText from '../../../../../extractedQueries/GradientText';

function BenefitsRoot({ 
  loading, 
  error, 
  product, 
  backgroundColor = '#C5FAFF4D',
  aspectRatio = '1/1.5',
  cardWidthPercentage = 70,
  cardSpacing = 10,
}) {
  const imageBand = [
    {
      urls: ["https://cdn.apptile.io/6a1f4f33-744a-418c-947e-30247efdbe91/dbf4466e-2076-4ca5-9738-c96a431782d9/original-480x480.png"],
      heading: "100%",
      subtitle: "Genuine"      
    },
    {
      urls: ["https://cdn.apptile.io/6a1f4f33-744a-418c-947e-30247efdbe91/5da618c4-c129-4449-af96-6cd38572006c/original-480x480.png"],
      heading: "Secure",
      subtitle: "Payment"
    },
    {
      urls: ["https://cdn.apptile.io/6a1f4f33-744a-418c-947e-30247efdbe91/c74bcd33-66d7-431c-82d6-f02137cc8ccd/original-480x480.png"],
      heading: "Free",
      subtitle: "Shipping"
    }
  ];
  const { width } = useApptileWindowDims();
  
  const ITEM_WIDTH = width * (cardWidthPercentage / 100); // Card width as percentage of screen width
  const SPACING = parseInt(cardSpacing, 10); // Configurable spacing between cards
  
  // Parse the aspect ratio string (format: "width/height")
  const parseAspectRatio = (ratioStr) => {
    try {
      const [width, height] = ratioStr.split('/').map(num => parseFloat(num));
      return width / height;
    } catch (e) {
      console.error("[APPTILE_AGENT] Error parsing aspect ratio:", e);
      return 1/1.5; // Default fallback
    }
  };

  const cardAspectRatio = parseAspectRatio(aspectRatio);

  if (loading) {
    return <ActivityIndicator size="large" color="#4DB6AC" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={{ backgroundColor, paddingVertical: 20 }}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <GradientText
            text="Key Benefits"
            fontSize={32}
            fontWeight="bold"
            width="100%"
            height={60}
            y="40"
          />
        </View>
        <RNText style={styles.errorText}>Error: {error.message || JSON.stringify(error)}</RNText>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Benefits Card */}
      {product?.textBenefits?.items?.length > 0 && (
        <BenefitsCard 
          title={product?.textBenefits?.title} 
          benefits={product?.textBenefits?.items} 
          style={{ marginBottom: 30 }}
        />
      )}

      <ThreeDCarousel
        carouselItems={product?.benefitsImages}
        itemWidth={ITEM_WIDTH}
        spacing={SPACING}
        cardAspectRatio={cardAspectRatio}
        width={width}
        backgroundColor={backgroundColor}
        title="Key Benefits"
      />

      {/* <ThreeDCarousel
        carouselItems={benefits.ingredients.images}
        itemWidth={ITEM_WIDTH}
        spacing={SPACING}
        cardAspectRatio={cardAspectRatio}
        width={width}
        backgroundColor={backgroundColor}
        title={benefits.ingredients.title}
      /> */}
      {imageBand.length > 0 && (
        <View 
          style={{
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            paddingVertical: 16,
            paddingHorizontal: 20
          }}
        >
          {imageBand.map((item, index) => {
            return (
              <View key={index} style={{flexDirection: 'row'}}>
                <Image 
                  style={{
                    height: 40, 
                    aspectRatio: 1,
                    marginRight: 8,
                  }}
                  source={{uri: item.urls?.[0]}}
                ></Image>
                <View style={{flexDirection: 'column'}}>
                  <RNText
                    style={{
                      fontSize: 13,
                      fontWeight: '800'
                    }}
                  >
                    {item.heading}
                  </RNText>
                  <RNText>{item.subtitle}</RNText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
  }
});

export default BenefitsRoot;
