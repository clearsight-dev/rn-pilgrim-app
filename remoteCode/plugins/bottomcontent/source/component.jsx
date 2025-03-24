import React from 'react';
import { View, Text } from 'react-native';

export function ReactComponent({ model }) {
  return (
    <View
      style={{
        height: 600,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text
        style={{
          fontSize: 20
        }}
      >
       hello world
      </Text>
    </View>
  );
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

