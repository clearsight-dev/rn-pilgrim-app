import React from 'react';
import FooterMilestone from './FooterMilestone';

export function ReactComponent({model}) {
  const rules = model.get('cartUpsellConfig') || {};
  const cartLineItems = model.get('cartLineItems') || [];
  return <FooterMilestone rules={rules} cartLineItems={cartLineItems} />;
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
  name: 'Rating Summary Card',
  defaultProps: {},
};
