import React from 'react'
import {Image, View} from 'react-native';

export default function JSSplash() {
  return (
    <View>
      <Image 
        resizeMode={"cover"}
        style={{width: '100%', height: '100%'}}
        source={require('../assets/splash.png')} 
      />
    </View>
  );
}
