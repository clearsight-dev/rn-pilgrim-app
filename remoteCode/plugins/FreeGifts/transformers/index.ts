import _ from 'lodash';

// ![Note] this logic is specific to pilgrim [Need to remove in future]
const getCollectionListData = (field: any) => {
  const references = field?.references?.nodes ?? [];
  return references.map(ref => ({
    collectionId: ref.id,
    handle: ref.handle,
    title: ref.title,
  }));
};

const getGiftItemData = (field: any) => {
  const product = field?.reference?.product;
  return {
    productId: product?.id,
    handle: product?.handle,
    title: product?.title,
    isAvailableForSale: field?.reference?.availableForSale,
    variant: {
      title: field?.reference?.title,
      variantId: field?.reference?.id,
      price: field?.reference?.price?.amount,
    },
  };
};

const transformRule = nodes => {
  return nodes.map(node => {
    const rule: Record<string, any> = {};
    const giftingType = node.fields.find(e => e.key === 'type').value;

    node.fields.forEach(field => {
      switch (field.key) {
        case 'collections':
          if (giftingType !== 'SPENDING_X_AMOUNT') {
            rule.collections = getCollectionListData(field);
          }
          break;
        case 'giftItems':
          rule.giftItems = getGiftItemData(field);
          break;
        case 'type':
          rule.type = field.value;
          break;
        case 'minAmount':
          if (
            ['SPENDING_X_AMOUNT_IN_COLLECTION_Y', 'SPENDING_X_AMOUNT'].includes(
              giftingType,
            )
          ) {
            rule.minAmount = Number(field.value);
          }
          break;
        case 'minProductsCount':
          if (giftingType === 'BUY_X_PRODUCT_FROM_COLLECTION_Y') {
            rule.minProductsCount = Number(field.value);
          }
          break;
        default:
          break;
      }
    });

    rule.discountOfferedOnFreeGift = {type: 'percentage', value: 100};
    return rule;
  });
};

export const transformMetaObjectToFreeGiftConfig = metaobject => {
  const config: Record<string, any> = {};
  metaobject.fields.forEach(field => {
    switch (field.key) {
      case 'isEnabled':
        config.isEnabled = field.value === 'true';
        break;
      case 'isMultipleFreeGiftAllowed':
        config.giftingConfig = {
          isAutomatic: true,
          isMultipleFreeGiftAllowed: field.value === 'true',
        };
        break;
      case 'rules':
        config.rules = transformRule(field.references.nodes);
        break;
      default:
        config[field.key] = field.value;
        break;
    }
  });

  config.discountConfig = {
    combinesWith: {
      orderDiscounts: true,
      productDiscounts: true,
      shippingDiscounts: true,
    },
  };

  return {
    name: config?.name,
    rules: _.get(config, 'rules', []).filter(entry =>
      _.get(entry, 'giftItems.isAvailableForSale', false),
    ),
    isEnabled: config?.isEnabled,
    giftingConfig: config?.giftingConfig,
    discountConfig: config?.discountConfig,
  };
};
