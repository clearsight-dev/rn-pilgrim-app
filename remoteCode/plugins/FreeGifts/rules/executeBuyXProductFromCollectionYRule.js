import _ from 'lodash';
import freeGiftsActions from '../actions/freeGiftsActions';

export const executeBuyXProductFromCollectionYRule = (
  ruleConfig,
  lineItems = [],
  cartLineCache = {},
  giftsToAdd,
) => {
  const minItemsCountAcrossCollections = ruleConfig?.minProductsCount || 0;
  const collectionsToCheck = new Set(
    _.get(ruleConfig, 'collections', [])
      .map(entry => entry?.collectionId)
      .filter(Boolean),
  );

  const lineItemsWithoutGifts =
    freeGiftsActions.getLinesWithoutFreeGift(lineItems);

  // Calculate total item count across all specified collections
  let totalItemCount = 0;
  lineItemsWithoutGifts.forEach(entry => {
    const pickCollectionFromMetaInfo =
      cartLineCache[entry?.variant?.id]?.product?.collections || [];
    const variantCollections = new Set(
      pickCollectionFromMetaInfo.map(collection => collection?.id),
    );
    const hasMatchingCollection = [...collectionsToCheck].some(id =>
      variantCollections.has(id),
    );

    if (hasMatchingCollection) {
      totalItemCount += entry?.quantity || 0;
    }
  });

  const giftId = ruleConfig?.giftItems?.variant?.variantId;
  const giftLineItem = lineItems.find(item => item?.variant?.id === giftId);

  // Check if the gifting rule is satisfied
  if (minItemsCountAcrossCollections <= 0) {
    return;
  }

  const isGiftingRuleSatisfied =
    totalItemCount >= minItemsCountAcrossCollections;

  // Apply the gifting rule
  if (isGiftingRuleSatisfied && _.isEmpty(giftLineItem)) {
    giftsToAdd.push({
      merchandiseId: giftId,
      attributes: [{key: 'apptile_free_product', value: 'true'}],
    });
  }
};
