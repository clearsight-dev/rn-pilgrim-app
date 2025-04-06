import React, { useRef } from 'react';
import { Animated, StyleSheet, View, Text, Platform } from 'react-native';
import {Svg, Path} from "react-native-svg";
import GradientText from '../../../../../extractedQueries/GradientText';
import GradientBackground from '../../../../../extractedQueries/GradientBackground';
import Underline from '../../../../../extractedQueries/Underline';
import RelatedProductCard from '../../../../../extractedQueries/RelatedProductCard';

function ThreeDProductCarousel({ 
  products = [], 
  itemWidth, 
  spacing, 
  width,
  onAddToCart,
  onSelectShade,
  loading
}) {
  const gradientColors = [
    { offset: "0%", color: "#D0F3F6", opacity: 0.7 },
    { offset: "100%", color: "#83CAD1", opacity: 1.0 }
  ];
  // Create internal scrollX state
  const scrollX = useRef(new Animated.Value(0)).current;

  const tabWidth = width * 0.5;
  const tabHeight = 40;
  const tabCornerRadius = 20;
  // The right circular arc is drawn from PI/4 to PI/2 and then a tangent is taken to the 
  // base of the tab. The left circular arc is a mirror of this.
  const arcOffsetAngle = Math.PI / 4; 

  return (
    <View style={styles.mainContainer}>
      {/* Rounded Tab with Gradient Text */}
      <View style={[styles.tabContainer, {width: tabWidth}]}>
        <Svg 
          width={tabWidth} 
          height={tabHeight}
          style={{position: "absolute"}}
        >
          <Path 
            d={`
              M ${tabCornerRadius},0 
              H ${tabWidth - tabCornerRadius}
              A ${tabCornerRadius} ${tabCornerRadius} 0 0 1 ${tabWidth - tabCornerRadius + tabCornerRadius * Math.cos(arcOffsetAngle)} ${tabCornerRadius - tabCornerRadius * Math.sin(arcOffsetAngle)}
              L ${tabWidth} ${tabHeight}
              H 0
              L ${tabCornerRadius - tabCornerRadius * Math.cos(arcOffsetAngle)} ${tabCornerRadius - tabCornerRadius * Math.sin(arcOffsetAngle)}
              A ${tabCornerRadius} ${tabCornerRadius} 0 0 1 ${tabCornerRadius} 0
              Z
              `}
            fill={"#83cad1"}
            opacity={0.25}
          />
        </Svg>
        <GradientText
          text="weekly picks"
          fontSize={26}
          fontWeight="bold"
          width="100%"
          height={40}
          y="25"
        />
      </View>

      {/* Top Finds Section */}
      <View style={styles.topFindsContainer}>
        <Text style={styles.topFindsText}>Top finds just for you</Text>
        <View style={styles.underlineContainer}>
          <Underline />
        </View>
      </View>

      {/* Gradient Background for Carousel */}
      <GradientBackground 
        id="weeklypicks"
        style={styles.carouselContainer} 
        gradientColors={gradientColors}
        gradientDirection="vertical"
      >
        <Animated.FlatList
          data={products}
          horizontal
          initialNumToRender={3}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={products.length > 0 ? 1 : 0}
          getItemLayout={(data, index) => {
            return {length: itemWidth, offset: index * itemWidth, index};
          }}
          contentContainerStyle={{
            paddingHorizontal: (width - itemWidth) / 2,
            paddingVertical: 20,
          }}
          snapToInterval={itemWidth + spacing}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item, index }) => {
            // Calculate the input range for animations
            const inputRange = [
              (index - 1) * (itemWidth + spacing),
              index * (itemWidth + spacing),
              (index + 1) * (itemWidth + spacing)
            ];
            
            // Calculate dynamic scale based on scroll position
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: 'clamp'
            });
            
            // Calculate dynamic translateY based on scroll position
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [20, 0, 20],
              extrapolate: 'clamp'
            });
            
            // Calculate dynamic opacity based on scroll position
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.7, 1, 0.7],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View 
                style={[
                  styles.slideContainer,
                  {
                    width: itemWidth,
                    marginHorizontal: spacing / 2,
                    transform: [{ scale }, { translateY }],
                    opacity,
                  }
                ]}
              >
                {loading ? (
                    <View 
                      style={[
                        styles.productCard,
                        {minHeight: 400, backgroundColor: 'white'}
                      ]}
                    >
                    </View>
                  ): (
                  <RelatedProductCard 
                    cardVariant={"large"}
                    product={item}
                    onAddToCart={onAddToCart}
                    onSelectShade={onSelectShade}
                    style={styles.productCard}
                  />
                )}
              </Animated.View>
            );
          }}
        />
      </GradientBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    marginVertical: 20,
  },
  tabContainer: {
    zIndex: 2,
    alignSelf: 'center',
    position: 'relative',
  },
  topFindsContainer: {
    backgroundColor: '#83cad13f',
    paddingHorizontal: 16,
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    zIndex: 1,
  },
  topFindsText: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
  },
  underlineContainer: {
    position: 'absolute',
    top: '100%',
    left: '60%',
    transform: [
      {
        scale: 0.5
      }
    ],
    alignItems: 'center',
  },
  carouselContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    width: '100%',
    borderRadius: 8,
    flexGrow: 1,
    paddingBottom: 8
  },
});

export default ThreeDProductCarousel;
