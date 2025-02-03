import React from 'react';
import {View} from 'react-native';

export function ReactComponent({model}) {
  const value = model.get('value')?.toString();
  console.log('value', value);
  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <iframe
        style={{height: '100%', width: '100%'}}
        src={value}
        headers={{'X-Frame-Options': 'SAMEORIGIN'}}
      />
    </View>
  );
}

export const WidgetConfig = {
  value: '',
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'value',
      props: {
        label: 'Value',
      },
    },
  ],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {},
};
