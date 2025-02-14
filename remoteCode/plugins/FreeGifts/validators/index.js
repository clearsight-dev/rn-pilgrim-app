import Joi from 'react-native-joi';

// ![Note] this validation is specific to pilgrim [Need to remove in future]
const collectionSchema = Joi.object({
  collectionId: Joi.string().required(),
  handle: Joi.string().required(),
  title: Joi.string().required(),
});

const variantSchema = Joi.object({
  title: Joi.string().required(),
  variantId: Joi.string().required(),
  price: Joi.number().required(),
});

const giftItemsSchema = Joi.object({
  productId: Joi.string().required(),
  handle: Joi.string().required(),
  title: Joi.string().required(),
  isAvailableForSale: Joi.boolean().required(),
  variant: variantSchema.required(),
});

const discountSchema = Joi.object({
  type: Joi.string().valid('percentage').required(),
  value: Joi.number().required(),
});

const ruleSchema = Joi.object({
  type: Joi.string()
    .valid(
      'SPENDING_X_AMOUNT_IN_COLLECTION_Y',
      'BUY_X_PRODUCT_FROM_COLLECTION_Y',
      'SPENDING_X_AMOUNT',
    )
    .required(),
  minAmount: Joi.number().when('type', {
    is: Joi.valid('SPENDING_X_AMOUNT_IN_COLLECTION_Y', 'SPENDING_X_AMOUNT'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  minProductsCount: Joi.number().when('type', {
    is: 'BUY_X_PRODUCT_FROM_COLLECTION_Y',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  collections: Joi.array()
    .items(collectionSchema)
    .when('type', {
      is: Joi.valid(
        'SPENDING_X_AMOUNT_IN_COLLECTION_Y',
        'BUY_X_PRODUCT_FROM_COLLECTION_Y',
      ),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  giftItems: giftItemsSchema.required(),
  discountOfferedOnFreeGift: discountSchema.required(),
});

export const ConfigSchema = Joi.object({
  isEnabled: Joi.boolean().required(),
  name: Joi.string().min(2).required(),
  giftingConfig: Joi.object({
    isAutomatic: Joi.boolean().required(),
    isMultipleFreeGiftAllowed: Joi.boolean().required(),
  }).required(),
  discountConfig: Joi.object({
    combinesWith: {
      orderDiscounts: Joi.boolean().required(),
      productDiscounts: Joi.boolean().required(),
      shippingDiscounts: Joi.boolean().required(),
    },
  }).required(),
  rules: Joi.array().items(ruleSchema).required(),
});
