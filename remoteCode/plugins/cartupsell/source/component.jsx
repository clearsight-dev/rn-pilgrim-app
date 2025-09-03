import React from 'react';
import CartUpsellProgress from './CartUpsellProgress';

export function ReactComponent({model}) {
  const rules = model.get('cartUpsellConfig') || {};
  const cartLineItems = model.get('cartLineItems') || [];
  return <CartUpsellProgress rules={rules} cartLineItems={cartLineItems} />;
}

export const WidgetConfig = {
  cartUpsellConfig: '',
  cartLineItems: [],
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
      name: 'cartLineItems',
      props: {
        label: 'Cart Line Items',
      },
    },
  ],
};

export const WrapperTileConfig = {
  name: 'Cart Upsell Progress',
  defaultProps: {},
};
