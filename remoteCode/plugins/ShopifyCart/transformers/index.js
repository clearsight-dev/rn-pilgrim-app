import _ from 'lodash';
import {
  convertStringToNumber,
  flattenConnection,
  formatDisplayPrice,
  formatQueryReturn,
  jsonObjectMapper,
} from 'apptile-core';
import {TransformProductVariant, TransformMetafields} from 'apptile-shopify';

//! [This transformer is copied from old shopify transformer have to refactored]
// ======================== Helper transformers ==============================//
// Cart //
export const TransformCartBuyerIdentity = (data) => {
  const buyerSchema = [
    'countryCode',
    {
      field: 'customerId',
      path: 'customer.id',
    },
    'email',
    'phone',
  ];

  return jsonObjectMapper(buyerSchema, data);
};

export const TransformCartDiscountCode = (data) => {
  const discountSchema = ['applicable', 'code'];

  return jsonObjectMapper(discountSchema, data);
};

// TODO: isSubscriptionProduct should be boolean
export const TransformSubscriptionCartLineItem = (data, context) => {
  if (!data) return;

  const {priceAdjustments} = data;

  const subscriptionsSchema = [
    {
      field: 'id',
      path: 'sellingPlan.id',
    },
    {
      field: 'isSubscriptionProduct',
      path: 'sellingPlan.recurringDeliveries',
    },
    {
      field: 'name',
      path: 'sellingPlan.name',
    },
  ];

  const adjustedPrice = priceAdjustments[0].perDeliveryPrice.amount;

  return {
    ...jsonObjectMapper(subscriptionsSchema, data),
    adjustedPrice,
    displayAdjustedPrice: formatDisplayPrice(context)(adjustedPrice),
  };
};

export const TransformProductAndCollectionWithMetafields = (data, _context) => {
  if (!data) return;

  const {title, handle, totalInventory, id, productType, collections, metafields} = data;

  const flattenedCollection = flattenConnection(collections);
  const transformedCollections = _.map(Array.isArray(flattenedCollection) ? flattenedCollection : [], entry => {
    return {
      id: entry.id,
      metafields: TransformMetafields(entry.metafields),
    };
  });

  return {
    title,
    handle,
    id,
    productType,
    metafields: TransformMetafields(metafields),
    totalInventory: totalInventory ?? 0,
    collections: transformedCollections,
  };
};

export const TransformCartProductVariant = (data, context) => {
  if (!data) return;

  const {product} = data;
  const {title, handle, totalInventory, id, productType, collections, vendor} = product;
  const transformedProductVariant = TransformProductVariant(data, context);

  const flattenedCollection = flattenConnection(collections);
  const transformedCollections = _.map(Array.isArray(flattenedCollection) ? flattenedCollection : [], entry => {
    return {
      id: entry.id,
    };
  });

  return {
    product: {
      title,
      handle,
      id,
      productType,
      totalInventory: totalInventory ?? 0,
      collections: transformedCollections,
      vendor,
    },
    ...transformedProductVariant,
  };
};

export const TransformCartLineItem = (data, context) => {
  if (!data) return;

  const {merchandise, sellingPlanAllocation} = data;

  const cartLineSchema = [
    {
      field: 'cartLineId',
      path: 'id',
    },
    'id',
    'quantity',
    {
      field: 'lineItemDiscount',
      path: 'discountAllocations',
      transform: (currentValue) => {
        return _.sumBy(currentValue, function (discountItem) {
          return parseFloat(_.get(discountItem, 'discountedAmount.amount', '0'));
        });
      },
    },
    {
      field: 'displayLineItemDiscount',
      path: 'discountAllocations',
      transform: (currentValue) => {
        return _.sumBy(currentValue, function (discountItem) {
          return parseFloat(_.get(discountItem, 'discountedAmount.amount', '0'));
        });
      },
      formatterFunction: formatDisplayPrice(context),
    },
    {
      field: 'attributes',
      path: 'attributes',
      transform: (currentValue) => {
        return _.map(currentValue, function (attribute) {
          return {
            key: _.get(attribute, 'key'),
            value: _.get(attribute, 'value'),
          };
        });
      },
    },
  ];

  const cartLineData = {
    ...jsonObjectMapper(cartLineSchema, data),
    variant: TransformCartProductVariant(merchandise, context),
    subscriptionProduct: TransformSubscriptionCartLineItem(sellingPlanAllocation, context),
  };

  return cartLineData;
};

export const TransformCheckoutLineItem = (data, context) => {
  if (!data) return;

  const checkoutLineSchema = [
    'id',
    'quantity',
    {
      field: 'variantId',
      path: 'merchandise.id',
    },
  ];

  return jsonObjectMapper(checkoutLineSchema, data);
};

// =========================== Master Transformers ==================================//
// Cart //
export const TransformCart = (data, context) => {
  if (!data) return;
  const {discountCodes, lines} = data;

  //TODO:CurrencyCode, channelId
  const cartSchema = [
    'id',
    'checkoutUrl',
    'note',
    'createdAt',
    'updatedAt',
    'totalQuantity',
    'ready',
    {
      field: 'cartId',
      path: 'id',
    },
    {
      field: 'subtotalAmount',
      path: 'cost.subtotalAmount.amount',
      transform: convertStringToNumber,
    },
    {
      field: 'totalAmount',
      path: 'cost.totalAmount.amount',
      transform: convertStringToNumber,
    },
    {
      field: 'totalDutyAmount',
      path: 'cost.totalDutyAmount.amount',
      transform: convertStringToNumber,
    },
    {
      field: 'totalTaxAmount',
      path: 'cost.totalTaxAmount.amount',
      transform: convertStringToNumber,
    },
    {
      field: 'checkoutChargeAmount',
      path: 'cost.checkoutChargeAmount.amount',
      transform: convertStringToNumber,
    },
    {
      field: 'displaySubtotalAmount',
      path: 'cost.subtotalAmount.amount',
      transform: convertStringToNumber,
      formatterFunction: formatDisplayPrice(context),
    },
    {
      field: 'displayTotalAmount',
      path: 'cost.totalAmount.amount',
      transform: convertStringToNumber,
      formatterFunction: formatDisplayPrice(context),
    },
    {
      field: 'displayTotalDutyAmount',
      path: 'cost.totalDutyAmount.amount',
      transform: convertStringToNumber,
      formatterFunction: formatDisplayPrice(context),
    },
    {
      field: 'displayTotalTaxAmount',
      path: 'cost.totalTaxAmount.amount',
      transform: convertStringToNumber,
      formatterFunction: formatDisplayPrice(context),
    },
    {
      field: 'displayCheckoutChargeAmount',
      path: 'cost.checkoutChargeAmount.amount',
      transform: convertStringToNumber,
      formatterFunction: formatDisplayPrice(context),
    },
  ];

  const cartData = {
    ...jsonObjectMapper(cartSchema, data),
    buyerIdentity: TransformCartBuyerIdentity(data.buyerIdentity),
    discountCodes: discountCodes.map(code => TransformCartDiscountCode(code)),
    lines: flattenConnection(lines)?.map(line => TransformCartLineItem(line, context)),
    checkoutLineItemData: flattenConnection(lines)?.map(line => TransformCheckoutLineItem(line, context)),
  };

  return cartData;
};

export const TransformCartPayload = (cartPayload, context) => {
  const cartData = cartPayload?.cart ?? undefined;
  const result = TransformCart(cartData, context);
  const errors = cartPayload.userErrors ?? [];
  return formatQueryReturn(result, cartData, {}, false, errors);
};

export const TransformCartMutations = (data, context) => {
  const cartPayload = _.get(Object.entries(data), '0.1', {});
  return TransformCartPayload(cartPayload, context);
};
