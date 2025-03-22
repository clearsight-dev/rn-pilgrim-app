import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Image,
  Animated,
  FlatList
} from 'react-native';
import { useSelector } from 'react-redux';
import { datasourceTypeModelSel, useApptileWindowDims } from 'apptile-core';
import { fetchProductData } from '../../../../extractedQueries/pdpquery';

// Carousel component that takes images as props
export function Carousel({ images, width }) {
  const scrollView = useRef();
  const handleIndexChange = useCallback((index) => {
    if (scrollView.current && index < images?.length) {
      scrollView.current.scrollToIndex({
        index: index,
        animated: true
      })
    }
  }, [images?.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'relative'
      }}
    >
      <FlatList
        ref={scrollView}
        data={images}
        style={{
          width: width,
        }}
        horizontal={true}
        keyExtractor={item => item.id || item.url}
        renderItem={({item}) => {
          return (
            <Image 
              source={{uri: item.url}}
              resizeMode="contain"
              style={{
                width: width,
                aspectRatio: 1
              }}
            />   
          )
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
      <View
        style={{
          position: "absolute",
          height: 20,
          width: 0.5 * width,
          bottom: 0,
          left: 0.25 * width,
        }}
      >
        <ScrollBubbles numBubbles={images.length} onIndexChange={handleIndexChange}/> 
      </View>
    </View>
  );
}

export function ScrollBubbles({numBubbles, onIndexChange, style}) {
  const BUBBLE_DURATION = 300;
  const PROGRESS_DURATION = 2000;
  const animationProgress = useRef(
    new Array(numBubbles).fill(0).map(() => new Animated.Value(1))
  ).current;
  const progressBarAnimation = useRef(new Animated.Value(0)).current;
  const bubbles = new Array(numBubbles).fill(0)

  const animationIndex = useRef(0);
  useEffect(() => {
    let cleanup = false;
    function runAnimation() {
      
      let i = animationIndex.current;
      const animationNode = animationProgress[i];
      Animated.sequence([
        Animated.timing(animationNode, {
          toValue: 2,
          duration: BUBBLE_DURATION,
          useNativeDriver: false
        }),
        Animated.timing(progressBarAnimation, {
          toValue: 1,
          duration: PROGRESS_DURATION,
          useNativeDriver: false
        })
      ])
      .start((finished) => {
        let nextIndex = (animationIndex.current + 1) % numBubbles
        if (onIndexChange) {
          onIndexChange(nextIndex)
        }
        if (finished) {
          let nextNodeIndex = (i + 1) % numBubbles
          let nextNode = animationProgress[nextNodeIndex]
          // After animation for expansion is done,
          // collapse the expanded node back to original width
          // and simultaneously expand the next node to expanded width
          Animated.parallel([
            Animated.timing(progressBarAnimation, {
              toValue: 0,
              duration: BUBBLE_DURATION,
              useNativeDriver: false
            }),
            Animated.timing(animationNode,
              {
                toValue: 1,
                duration: BUBBLE_DURATION,
                useNativeDriver: false
              }
            ),
            Animated.timing(nextNode,
              {
                toValue: 2,
                duration: BUBBLE_DURATION,
                useNativeDriver: false
              }
            )
          ])
          .start(({finished}) => {
            if (finished && !cleanup) {
              animationIndex.current = nextIndex;
              // once the next node has been expanded, 
              // start over if effect hasn't been cleaned up
              runAnimation()
            } else if (cleanup) {
              animationIndex.current = 0;
              animationProgress.map(node => {
                node.setValue(1)
              })
            }
          })     
        }
      })
    }

    runAnimation()
    return () => {
      cleanup = true;
    }
  }, [animationIndex.current, animationProgress, onIndexChange])

  return (
    <View style={{flexDirection: 'row', justifyContent: 'center', paddingBottom: 8}}>
      { 
        bubbles.map((_, i) => {
          return (
            <Animated.View 
              style={{
                margin: 3,
                width: Animated.add(7, 
                  Animated.multiply(1, 
                    animationProgress[i].interpolate({
                      inputRange: [1, 2],
                      outputRange: [1, 18]
                    })
                  )
                ), 
                height: 8, 
                borderRadius: 5,
                borderColor: "#ffffff", 
                backgroundColor: "#ffffff", // Changed from semi-transparent to solid white
                borderWidth: 2,
                // Add shadow for visibility on white backgrounds
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 3 // For Android
              }}
            >
              <Animated.View
                style={{
                  backgroundColor: 'gray',
                  width: progressBarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 20]
                  }),
                  height: 4,
                  borderRadius: 5,
                  opacity: animationProgress[i].interpolate({
                    inputRange: [1, 2],
                    outputRange: [0, 1]
                  })
                }}
              >
              </Animated.View>
            </Animated.View>
          )
        })
      }
    </View>);
}


// Main component that handles data fetching
export function ReactComponent({ model }) {
  const {width: screenWidth} = useApptileWindowDims();
  const shopifyDSModel = useSelector(state => datasourceTypeModelSel(state, 'shopifyV_22_10'));
  const [images, setImages] = useState(null);

  useEffect(() => {
    const queryRunner = shopifyDSModel?.get('queryRunner');
    fetchProductData(queryRunner, "3-redensyl-4-anagain-hair-growth-serum")
      .then(res => {
        const images = res.data.productByHandle.images.edges.map((it, i) => {
          return {
            id: i.toString(),
            url: it.node.url
          };
        })
        setImages(images)
      })
      .catch(err => {
        console.error(err.toString());
      })
  }, [shopifyDSModel]);

  // Use the Carousel component with the fetched images
  return <Carousel images={images} width={screenWidth} />;
}

export const WidgetConfig = {
};

export const WidgetEditors = {
  basic: [],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};
