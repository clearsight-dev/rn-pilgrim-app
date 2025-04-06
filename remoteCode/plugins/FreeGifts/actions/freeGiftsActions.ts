import _ from 'lodash';
import {Rule, GiftingConfig} from './types';
import RULE_EXECUTION_MAP from '../rules';

class FreeGiftsActions {
  getLinesWithoutFreeGift = (lineItems: any[] = []) => {
    return lineItems.filter(
      entry =>
        !_.get(entry, 'attributes', []).some(
          attr => attr?.key === 'apptile_free_product',
        ),
    );
  };

  separateGiftsAndLineItems = (lineItems: any[] = []) => {
    const lineItemsWithoutGifts = [];
    const giftLineItems = [];

    lineItems.forEach(entry => {
      if (
        !_.get(entry, 'attributes', []).some(
          attr => attr?.key === 'apptile_free_product',
        )
      ) {
        lineItemsWithoutGifts.push(entry);
      } else {
        giftLineItems.push(entry);
      }
    });

    return {
      lineItemsWithoutGifts,
      giftLineItems,
    };
  };

  attachFreebieToCartLineItems = (
    model: any,
    cartObject: any,
    cartLineCache: any = {},
  ) => {
    const freeGiftConfig = model?.get('config') || {};

    if (_.isEmpty(freeGiftConfig)) {
      console.error('Please define free gift config');
      return {
        giftsToAdd: [],
        giftsToRemove: [],
      };
    }

    const {isEnabled = false, rules = [], giftingConfig = {}} = freeGiftConfig;
    const lineItems = _.get(cartObject, 'lines', []);

    // If free gifts are not enabled, remove any existing free gifts from the line items
    if (!isEnabled) {
      const giftsToRemove = [];
      lineItems.map(entry => {
        const isFreeProduct = (entry?.attributes || []).some(
          attr => attr?.key === 'apptile_free_product',
        );
        if (isFreeProduct) {
          giftsToRemove.push(entry);
        }
      });

      return {
        giftsToAdd: [],
        giftsToRemove,
      };
    }

    // Apply automatic rule execution to determine and update the line items with free gifts
    return this.ruleExecutor(rules, lineItems, giftingConfig, cartLineCache);
  };

  ruleExecutor = (
    rules: Rule[] = [],
    lineItems: any[] = [],
    giftConfig: GiftingConfig = {},
    cartLineCache: any = {},
  ) => {
    const {isMultipleFreeGiftAllowed} = giftConfig;
    let giftsToAdd = [];
    let giftsToRemove = [];

    const {lineItemsWithoutGifts, giftLineItems} =
      this.separateGiftsAndLineItems(lineItems);
    let currentLineItems = [...lineItemsWithoutGifts];

    const currentCampaignGiftsPriceMap: {[key: string]: number} = rules.reduce(
      (result, rule) => {
        const merchandiseId = _.get(rule, 'giftItems.variant.variantId');
        const itemPrice = _.get(rule, 'giftItems.variant.price');

        if (!_.isNil(merchandiseId) && !_.isNil(itemPrice)) {
          result[merchandiseId] = itemPrice;
        }
        return result;
      },
      {},
    );

    // Execute each rule to update the line items accordingly
    rules.forEach(entry => {
      const executor = RULE_EXECUTION_MAP[entry.type];
      if (executor) {
        executor(entry, currentLineItems, cartLineCache, giftsToAdd);
      }
    });

    // Only adding gift with highest value in case of isMultipleFreeGiftAllowed flag turned off
    const highestValueGift = giftsToAdd.sort(
      (a, b) =>
        currentCampaignGiftsPriceMap[b.merchandiseId] -
        currentCampaignGiftsPriceMap[a.merchandiseId],
    )[0];

    if (!isMultipleFreeGiftAllowed && !_.isEmpty(highestValueGift)) {
      giftsToAdd = [highestValueGift];
    }

    const transformGiftLineItems = giftLineItems.map(entry => {
      return {
        merchandiseId: entry?.variant?.id,
        id: entry?.cartLineId,
      };
    });

    // Remove all the free gifts which do not exist in the current campaign & not eligible gifts
    giftsToRemove = _.differenceBy(
      transformGiftLineItems,
      giftsToAdd,
      'merchandiseId',
    );

    // Eliminating already eligible gift to be added again
    const existingGiftInCart = _.intersectionBy(
      transformGiftLineItems,
      giftsToAdd,
      'merchandiseId',
    );
    giftsToAdd = _.differenceBy(
      giftsToAdd,
      existingGiftInCart,
      'merchandiseId',
    );

    // Additional validation to keep the quantity of the free gift as a single item.
    giftsToAdd = giftsToAdd.map(entry => {
      return {...entry, quantity: 1};
    });

    return {
      giftsToAdd,
      giftsToRemove,
    };
  };
}

const freeGiftsActions = new FreeGiftsActions();
export default freeGiftsActions;
