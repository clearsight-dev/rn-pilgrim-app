import _ from 'lodash';
import freeGiftsActions from '../actions/freeGiftsActions';

export const executeSpendingXAmountInCollectionYRule = (
  ruleConfig,
  lineItems = [],
  cartLineCache = {},
  giftsToAdd,
) => {
  const minAmount = ruleConfig?.minAmount || 0;
  const purchaseAmountByCollection = {};

  _.get(ruleConfig, 'collections', []).forEach(entry => {
    const collectionId = entry?.collectionId;
    if (collectionId) {
      purchaseAmountByCollection[collectionId] = 0;
    }
  });

  const lineItemsWithoutGifts =
    freeGiftsActions.getLinesWithoutFreeGift(lineItems);

  // Calculate purchase amount per collection
  lineItemsWithoutGifts.forEach(entry => {
    const pickCollectionFromMetaInfo =
      cartLineCache[entry?.variant?.id]?.product?.collections || [];
    const variantCollections = pickCollectionFromMetaInfo.map(
      collection => collection?.id,
    );
    const intersectingCollections = _.intersection(
      variantCollections,
      Object.keys(purchaseAmountByCollection),
    );
    const variantPrice =
      entry?.variant?.salePrice * entry?.quantity - entry?.lineItemDiscount;

    intersectingCollections.forEach(collectionId => {
      if (purchaseAmountByCollection.hasOwnProperty(collectionId)) {
        purchaseAmountByCollection[collectionId] += variantPrice;
      }
    });
  });

  const giftId = ruleConfig?.giftItems?.variant?.variantId;
  const giftLineItem = lineItems.find(item => item?.variant?.id === giftId);

  // Check if the gifting rule is satisfied
  if (!minAmount) {
    return;
  }

  const isGiftingRuleSatisfied = Object.values(purchaseAmountByCollection).some(
    collectionPurchaseAmount => collectionPurchaseAmount >= minAmount,
  );

  // Apply the gifting rule
  if (isGiftingRuleSatisfied) {
    if (_.isEmpty(giftLineItem)) {
      giftsToAdd.push({
        merchandiseId: giftId,
        attributes: [{key: 'apptile_free_product', value: 'true'}],
      });
    }
  }
};
