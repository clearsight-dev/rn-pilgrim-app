import React from 'react';
import { View } from 'react-native';
import PilgrimCode from '../../../../extractedQueries/PilgrimCode';
import FAQComponent from './FAQComponent';
import ExternalLinks from '../../../../extractedQueries/ExternalLinks';
export function ReactComponent({ model }) {
  const content = model.get('labelledIcons') || [];
  const staticImages = model.get('staticImages') || {};
  
  return (
    <View>
      <PilgrimCode content={content} />
      <FAQComponent />
      <ExternalLinks staticImages={staticImages}/>
    </View>
  );
}

export const WidgetConfig = {
  labelledIcons: [],
  staticImages: {
    girl: [],
    fb: [], 
    insta: [],
    youtube: [],
    linkedin: [],
    pilgrim: []
  }
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
    },
    {
      type: 'customData',
      name: 'staticImages',
      props: {
        label: 'Static Images',
        schema: {
          type: 'object',
          fields: {
            girl: {type: 'image'},
            fb: {type: 'image'},
            insta: {type: 'image'},
            youtube: {type: 'image'},
            linkedin: {type: 'image'},
            pilgrim: {type: 'image'}
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
