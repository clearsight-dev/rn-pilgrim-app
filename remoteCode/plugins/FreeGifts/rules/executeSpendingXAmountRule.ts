import {Rule} from '../actions/types';
import _ from 'lodash';

export const executeSpendingXAmountRule = (
  ruleConfig: Rule,
  lineItems: any[] = [],
  _cartLineCache: any = {},
  giftsToAdd: any[],
) => {
  const totalPrice = lineItems.reduce((total, entry) => {
    if (
      _.get(entry, 'attributes', []).some(
        attr => attr?.key === 'apptile_free_product',
      )
    ) {
      return total;
    }
    return (
      total +
      entry?.variant?.salePrice * entry?.quantity -
      entry?.lineItemDiscount
    );
  }, 0);

  const minAmount = ruleConfig?.minAmount || 0;
  const giftId = ruleConfig?.giftItems?.variant?.variantId;
  const giftLineItem = lineItems.find(item => item?.variant?.id === giftId);
  const isGiftingRuleSatisfied = !(!minAmount || totalPrice <= minAmount);

  if (isGiftingRuleSatisfied) {
    if (_.isEmpty(giftLineItem)) {
      // Add the free gift if the condition is satisfied and it's not already added
      giftsToAdd.push({
        merchandiseId: giftId,
        attributes: [{key: 'apptile_free_product', value: 'true'}],
      });
    }
  }
};
