import React from 'react';
import AvailableCoupons from './AvailableCoupons';

export function ReactComponent({model}) {
  const rules = model.get('cartUpsellConfig') || {};
  const currentCart = model.get('currentCart') || {};
  const syncingCartStatus = model.get('syncingCartStatus') || false;
  const alignment = model.get('alignment') || 'horizontal';
  const hideExcessFields = model.get('hideExcessFields') || 'false';
  return (
    <AvailableCoupons
      rules={rules}
      currentCart={currentCart}
      syncingCartStatus={syncingCartStatus}
      alignment={alignment}
      hideExcessFields={hideExcessFields}
    />
  );
}

export const WidgetConfig = {
  cartUpsellConfig: '',
  currentCart: {},
  alignment: 'horizontal',
  hideExcessFields: 'false',
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
    {
      type: 'codeInput',
      name: 'alignment',
      props: {
        label: 'Alignment',
      },
    },
    {
      type: 'codeInput',
      name: 'hideExcessFields',
      props: {
        label: 'Hide Excess Fields',
      },
    },
  ],
};

export const WrapperTileConfig = {
  name: 'Rating Summary Card',
  defaultProps: {},
};
