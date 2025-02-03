import React from 'react';
import { Image, Text } from 'react-native';

export function ReactComponent({ model }) {
  const url = model.get('url') || 'https://linentrail.com/cdn/shop/products/171.jpg';
  const height = model.get('height') || 200;
  const width = model.get('width') || 'auto';
  return (
    <Image 
      style={{
        height: height,
        width: width,
      }}
      source={{uri: url}}
    />
  );
}

export const WidgetConfig = {
  url: ''
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'url',
      props: {
        label: 'Url for image'
      }
    },
    {
      type: 'codeInput',
      name: 'width',
      props: {
        label: 'Width for image'
      }
    },
    {
      type: 'codeInput',
      name: 'height',
      props: {
        label: 'Height for image'
      }
    }
  ],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};

