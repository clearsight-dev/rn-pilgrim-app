import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import GradientText from '../../../../../extractedQueries/GradientText';
import {Image} from '../../../../../extractedQueries/ImageComponent';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ThreeDCarousel = ({ 
  carouselItems, 
  itemWidth, 
  spacing, 
  cardAspectRatio, 
  width,
  backgroundColor = '#C5FAFF4D',
  title = ''
}) => {
  // Create internal scrollX state
  const scrollX = useRef(new Animated.Value(0)).current;
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Gradient Title */}
      <View style={styles.svgContainer}>
        <GradientText
          text={title}
          fontSize={32}
          fontWeight="bold"
          width="100%"
          height={60}
          y="40"
        />
      </View>
      
    <Animated.FlatList
      data={carouselItems}
      horizontal
      initialNumToRender={2}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: (width - itemWidth) / 2,
      }}
      snapToInterval={itemWidth + spacing}
      decelerationRate="fast"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      keyExtractor={(_, index) => index.toString()}
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
          outputRange: [0.7, 1, 0.7],
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
                marginHorizontal: spacing / 4,
                transform: [{ scale }, { translateY }],
                opacity,
              }
            ]}
          >
            <View style={[styles.benefitCard, { aspectRatio: cardAspectRatio }]}>
              <AnimatedImage 
                source={{ uri: item.imageUrl }} 
                style={styles.benefitImage} 
                resizeMode="contain" 
              />
            </View>
          </Animated.View>
        );
      }}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  svgContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCard: {
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  benefitImage: {
    width: '100%',
    height: '100%',
  },
});

export default ThreeDCarousel;
