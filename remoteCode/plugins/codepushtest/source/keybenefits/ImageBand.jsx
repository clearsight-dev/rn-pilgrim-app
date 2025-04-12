import React from 'react';
import {Text, View} from 'react-native';
import { Image } from '../../../../../extractedQueries/ImageComponent';
import { colors, typography } from '../../../../../extractedQueries/theme';

export default function ImageBand() {
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

  return (
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
              <Text
                style={[
                  typography.family,
                  {
                    fontSize: 13,
                    fontWeight: '800',
                    color: colors.dark100
                  }
                ]}
              >
                {item.heading}
              </Text>
              <Text style={[typography.body14]}>{item.subtitle}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}