import _ from 'lodash';

export const calculateItemTotalPrice = cartLineItem => {
  return (
    _.round(
      cartLineItem.quantity * cartLineItem.variant.salePrice -
        cartLineItem.lineItemDiscount,
      2,
    ) || 0
  );
};
