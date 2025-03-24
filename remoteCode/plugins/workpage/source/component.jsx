import React from 'react';
import { View } from 'react-native';
import PilgrimCode from './PilgrimCode';
import FAQComponent from './FAQComponent';
import ExternalLinks from './ExternalLinks';
export function ReactComponent({ model }) {
  const content = model.get('labelledIcons') || [];
  
  return (
    <View>
      <PilgrimCode content={content} />
      <FAQComponent />
      <ExternalLinks />
    </View>
  );
}

export const WidgetConfig = {
  labelledIcons: []
};

export const WidgetEditors = {
  basic: [
    {
      type: 'customData',
      name: 'labelledIcons',
      props: {
        label: 'Images and blurbs',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            fields: {
              blurb: {type: 'string'},
              urls: {type: 'image'}
            }
          }
        }
      }
    }
  ],
};

export const PropertySettings = {};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {
  },
};
