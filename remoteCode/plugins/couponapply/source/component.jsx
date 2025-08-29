import React from 'react';
import {View, Text} from 'react-native';
import CouponApply from './CouponApply';

export function ReactComponent({model}) {
  const currentCart = model.get('currentCart') || {};

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <CouponApply />
    </View>
  );
}

export const WidgetConfig = {
  currentCart: {},
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'currentCart',
      props: {
        label: 'Current Cart',
      },
    },
  ],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {},
};
