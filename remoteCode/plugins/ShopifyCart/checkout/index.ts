import {
  ShopifyCheckoutSheet,
  ColorScheme,
  CheckoutCompletedEvent,
} from '@shopify/checkout-sheet-kit';
import _ from 'lodash';

export const shopifyCheckout = new ShopifyCheckoutSheet({
  colorScheme: ColorScheme.web, // <== forcing checkoutsheet to use web theme
});

export const transformPurchaseEvent = (event: CheckoutCompletedEvent) => {
  return {
    orderId: _.get(event, ['orderDetails', 'id']),
    orderName: _.get(event, ['orderDetails', 'id']),
    totalValue: _.get(
      event,
      ['orderDetails', 'cart', 'price', 'total', 'amount'],
      0,
    ),
    taxPrice: _.get(
      event,
      ['orderDetails', 'cart', 'price', 'taxes', 'amount'],
      0,
    ),
    shippingAmount: _.get(
      event,
      ['orderDetails', 'cart', 'price', 'shipping', 'amount'],
      0,
    ),
    subTotal: _.get(
      event,
      ['orderDetails', 'cart', 'price', 'subtotal', 'amount'],
      0,
    ),
    totalDiscount: _.sumBy(
      _.get(event, ['orderDetails', 'cart', 'price', 'discounts'], []),
      entry => {
        return _.get(entry, ['amount', 'amount'], 0);
      },
    ),
    totalItems: _.size(_.get(event, ['orderDetails', 'cart', 'lines'], [])),
    currency: _.get(event, [
      'orderDetails',
      'cart',
      'price',
      'total',
      'currencyCode',
    ]),
    items: _.get(event, ['orderDetails', 'cart', 'lines'], []).map(entry => {
      return {
        title: entry.title,
        quantity: entry.quantity,
        productId: entry.productId,
        price: entry.price.amount,
        currency: entry.price.currencyCode,
        variantId: entry.merchandiseId,
        discount: _.sumBy(entry.discounts, o =>
          _.get(o, ['amount', 'amount'], 0),
        ),
      };
    }),
  };
};
