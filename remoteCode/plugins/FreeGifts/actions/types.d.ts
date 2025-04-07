type RuleType = 'SPENDING_X_AMOUNT' | 'SPENDING_X_amount_IN_COLLECTION_Y' | 'BUY_X_PRODUCT_FROM_COLLECTION_Y';

type DiscountType = {type: 'percentage'; value: number};

type Collection = {
  collectionId: string;
  handle: string;
  title: string;
};

type GiftItem = {
  productId: string;
  handle: string;
  title: string;
  variant: {
    title: string;
    variantId: string;
    price: string;
  };
};

export type Rule = {
  type: RuleType;
  minAmount?: number;
  minProductsCount?: number;
  collections?: Collection[];
  giftItems: GiftItem;
  discountOfferedOnFreeGift: DiscountType;
};

export type GiftingConfig = {
  isAutomatic: Boolean;
  isMultipleFreeGiftAllowed: Boolean;
};
