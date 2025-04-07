import React from "react";
import {Carousel} from '../../../../extractedQueries/ImageCarousel';
import {View, Text, Pressable} from 'react-native';
import {Image} from "../../../../extractedQueries/ImageComponent";

export default function BannerCarousel({items, screenWidth, onNavigate}) {
  return (
    <View style={{ position: 'relative' }}>
      <Carousel
        flatlistData={items.map(
          (it, i) => ({
            id: i,
            ...it,
            url: it.urls[0],
          })
        )}
        width={screenWidth}
        renderChildren={({ item }) => {
          return (
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: item.url }}
                resizeMode="contain"
                style={{
                  width: screenWidth,
                  aspectRatio: 1.7,
                  minHeight: 100,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 200,
                  left: 10
                }}
              >
                <Text
                  style={{
                    fontSize: 44,
                    fontWeight: '600'
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '300'
                  }}
                >
                  {item.subtitle}
                </Text>
                <Pressable
                  onPress={() => {
                    if (item.collection) {
                      onNavigate('NewCollection', { collectionHandle: item.collection });
                    } else if (item.product) {
                      onNavigate('NewProduct', { productHandle: item.product });
                    }
                  }}
                  style={{
                    height: 33,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff88',
                    marginTop: 20,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    width: 100,
                  }}
                >
                  <Text>Shop now -&gt;</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>)
}