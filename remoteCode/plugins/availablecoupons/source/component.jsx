import React from 'react';
import AvailableCoupons from './AvailableCoupons';

export function ReactComponent({model}) {
  const rules = model.get('cartUpsellConfig') || {};
  const currentCart = model.get('currentCart') || {};
  const syncingCartStatus = model.get('syncingCartStatus') || false;
  return (
    <AvailableCoupons
      rules={rules}
      currentCart={currentCart}
      syncingCartStatus={syncingCartStatus}
    />
  );
}

export const WidgetConfig = {
  cartUpsellConfig: '',
  currentCart: {},
};

export const WidgetEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'cartUpsellConfig',
      props: {
        label: 'Cart Upsell Config',
      },
    },
    {
      type: 'codeInput',
      name: 'currentCart',
      props: {
        label: 'Current Cart',
      },
    },
    {
      type: 'codeInput',
      name: 'syncingCartStatus',
      props: {
        label: 'Cart Sync Status',
      },
    },
  ],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {},
};
