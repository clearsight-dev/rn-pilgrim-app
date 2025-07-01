import React from 'react';
import { View, Text } from 'react-native';
import BlogArticleScreen from '../../../../src/screens/Blog/BlogScreen';

export function ReactComponent({ model }) {
  return (
    <BlogArticleScreen />
  );
}

export const WidgetConfig = {
};

export const WidgetEditors = {
  basic: [],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};

