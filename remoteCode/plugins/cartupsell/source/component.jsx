import React from 'react';
import CartUpsellProgress from './CartUpsellProgress';

export function ReactComponent({model}) {
  const upsellConfig = model.get('cartUpsellConfig') || {};
  return <CartUpsellProgress rules={upsellConfig} />;
}

export const WidgetConfig = {
  cartUpsellConfig: '',
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
  ],
};

export const WrapperTileConfig = {
  name: 'Cart Upsell Progress',
  defaultProps: {},
};
