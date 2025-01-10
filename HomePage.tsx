import React from 'react';
import {Image, View, Modal} from 'react-native';

export default function Splash() {
  return (
    <Modal statusBarTranslucent transparent>
      <View style={{ 
          backgroundColor: '#F6E0E1', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '100%' 
        }}
      >  
        <Image
              resizeMode={"contain"}
              source={require('./assets/splash-lite.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 8
              }}
            />
      </View>
    </Modal>
  );
}
