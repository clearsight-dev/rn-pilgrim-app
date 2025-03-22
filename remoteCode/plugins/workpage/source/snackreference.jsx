import React, {useRef, useEffect, useState} from 'react'
import { Text, View, SafeAreaView, StyleSheet, FlatList, ScrollView, Image, Animated, PanResponder } from 'react-native';
import Svg, {Path, Line} from 'react-native-svg'
function ScrollBubbles({numBubbles, onIndexChange}) {
  const animationProgress = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;
  const bubbles = new Array(numBubbles).fill(0)

  const animationIndex = useRef(0);
  useEffect(() => {
    function runAnimation() {
      if (onIndexChange) {
        onIndexChange(animationIndex.current)
      }
      let i = animationIndex.current;
      const animationNode = animationProgress[i];
      Animated.sequence([
        Animated.timing(animationNode,
          {
            toValue: 2,
            duration: 500,
            useNativeDriver: false
          }
        ),
        Animated.delay(500)
      ])
      .start((finished) => {
        if (finished) {
          let nextNodeIndex = (i + 1) % 4
          let nextNode = animationProgress[nextNodeIndex]
          Animated.parallel([
            Animated.timing(animationNode,
              {
                toValue: 1,
                duration: 500,
                useNativeDriver: false
              }
            ),
            Animated.timing(nextNode,
              {
                toValue: 2,
                duration: 500,
                useNativeDriver: false
              }
            )
          ])
          .start(({finished}) => {
            if (finished) {
              let nextIndex = (animationIndex.current + 1) % 4
              animationIndex.current = nextIndex;
              runAnimation()
            }
          })     
        }
      })
    }

    runAnimation()
  }, [animationIndex.current, animationProgress, onIndexChange])

  return (
    <View style={{flexDirection: 'row', justifyContent: 'center', paddingBottom: 8}}>
      
      { 
        bubbles.map((_, i) => {
          return (
            <Animated.View 
              style={{
                margin: 5,
                width: Animated.multiply(8, animationProgress[i]), 
                height: 8, 
                borderRadius: 5,
                borderColor: "#ffffff", 
                backgroundColor: "#ffffffcc",
                borderWidth: 2
              }}
            >
            </Animated.View>
          )
        })
      }
    </View>);
}

const CARD_HEIGHT = 200;
const CARD_WIDTH = 300;
const CARD_TEXTCONATINER_HEIGHT = 70;

export default function Carousel() {
  const scrollView = useRef();
  const dishData = [
    {
      id: "first",
      url: 'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/lasagne-al-forno-by-adriano-homecooks-952555_480x480.jpg'
    },
    {
      id: "second",
      url: 'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/chicken-tagine-by-pessima-homecooks-666220_480x480.jpg'
    },
    {
      id: "third",
      url: 'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/caribbean-chicken-curry-by-pessima-homecooks-167185_480x480.jpg'
    },
    {
      id: "fourth",
      url: 'https://cdn.shopify.com/s/files/1/0608/0243/3076/files/malagasy-style-vegetable-curry-by-lilias-kitchen-homecooks-262695_480x480.jpg'
    }
  ];
  const handleIndexChange = (index) => {
    if (scrollView.current) {
      scrollView.current.scrollToIndex({
        index: index,
        animated: true
      })
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rootView}>
        <View 
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: 16,
            backgroundColor: 'white',
            overflow: 'hidden'
          }}
        >
          <FlatList
            ref={scrollView}
            data={dishData}
            style={{
              width: CARD_WIDTH,
              height: (CARD_HEIGHT - CARD_TEXTCONATINER_HEIGHT)
            }}
            horizontal={true}
            keyExtractor={item => item.id}
            renderItem={({item}) => {
              return (
              <Image 
                  source={{uri: item.url}}
                  resizeMode="cover"
                  style={{
                    width: CARD_WIDTH,
                    height: (CARD_HEIGHT - CARD_TEXTCONATINER_HEIGHT)
                  }}
                ></Image>   
              )
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
          <View
            style={{
              position: "absolute",
              height: 20,
              width: 0.5 * CARD_WIDTH,
              bottom: CARD_TEXTCONATINER_HEIGHT,
              right: 10,
            }}
          >
            <ScrollBubbles numBubbles={4} onIndexChange={handleIndexChange}/> 
          </View>
          <View 
            style={{
              position: 'absolute',
              bottom: CARD_TEXTCONATINER_HEIGHT,
              transformOrigin: 'bottom',
              transform: [
                {scaleY: 0.6}
              ]
            }}
          >
            <Svg width={CARD_WIDTH} height={35} viewBox={`1 0 ${CARD_WIDTH} 35`}>
              <Path d="M284 40H1V1H98C127 1 122 3 131 18C138.2 30 148.667 33.6667 153 34H284V40Z" fill="white"/>
            </Svg>
          </View>
          <Text 
            style={{
              position: "absolute",
              bottom: CARD_TEXTCONATINER_HEIGHT + 4,
              paddingLeft: 8,
              fontSize: 10
            }}
          >
            28 mins * 2.5 km * Free
          </Text>
          <View 
            style={{
              width: '100%',
              height: CARD_TEXTCONATINER_HEIGHT,
              position: "absolute",
              bottom: 0,
              backgroundColor: "white",
              paddingTop: 4,
              paddingLeft: 8,
              paddingRight: 8,
              paddingBottom: 8
            }}
          >
            <View 
              style={{
                justifyContent: 'space-between',
                flexDirection: "row"
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                Homely Hut
              </Text>
              <Text 
                style={{
                  backgroundColor: 'green',
                  color: "white",
                  padding: 2,
                  paddingLeft: 4,
                  paddingRight: 4,
                  borderRadius: 4
                }}
              >
                4.2 *
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: '#aaaaaa',
                paddingTop: 4,
                paddingBottom: 4
              }}
            >
              Pure Veg . North Indian . 150 for one
            </Text>
            <View>
              <Svg width={CARD_WIDTH} height={5} viewBox={`0 0 ${CARD_WIDTH} 5`}>
                <Line 
                  x1="0" y1="2" x2={CARD_WIDTH - 18} y2="2" 
                  stroke-dasharray="4 2" 
                  stroke="#dddddd" 
                  stroke-width="1"
                />
              </Svg>
            </View>
            <Text 
              style={{
                fontSize: 11,
                fontWeight: "semi-bold",
                color: "blue"
              }}
            >
              20% OFF up to rs. 50
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  rootView: {
    width: '100%',
    height: '100%',
    padding: 10,
    // borderWidth: 2, 
    // borderColor: 'red'
  }
});
