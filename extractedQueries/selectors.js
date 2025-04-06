import {createSelector} from 'reselect';

import {useSelector, shallowEqual, useDispatch} from 'react-redux';
import { 
  datasourceTypeModelSel, 
  selectAppConfig, 
  selectAppModel, 
  globalPluginsSelector,
  store
} from 'apptile-core';

// This function is an optimization over trying to get the queryRunner using a 
// selector because the only way to get the shopify query runner using a selector
// will have to read the immutable shopify model that changes too much and triggers
// re-renders. This way we can get this value once in pilgrimglobals
let queryRunner = null;
export async function cheaplyGetShopifyQueryRunner(reevaluate) {
  const decayIntervals = [10, 50, 100, 300, 500, 1000, 2000, 3000];
  const currentDelay = 0;
  if (queryRunner && queryRunner.runQuery && queryRunner.runQuery.call && !reevaluate) {
    return queryRunner;
  } else {
    if (reevaluate) {
      queryRunner = null;
    }

    console.log("Updating shopify queryRunner!");
    do {
      const state = store.getState();
      const stageModel = state.stageModel;
      const shopifyDSModel = stageModel.values?.find((modelVal, modelKey) => {
        return 'shopifyV_22_10' === modelVal.get('pluginType', null);
      });
      if (shopifyDSModel) {
        queryRunner = shopifyDSModel.get("queryRunner");
      }

      if (!queryRunner || !(queryRunner.runQuery && queryRunner.runQuery.call)) {
        console.log("Waiting for queryRunner to become available: ", decayIntervals[currentDelay]);
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({});
          }, decayIntervals[currentDelay++]);
        })
        queryRunner = null;
      }
    } while (!queryRunner && currentDelay < decayIntervals.length);

    if (!queryRunner) {
      throw new Error("Even after waiting for a long time, shopify query runner could not be found");
    }

    return queryRunner;
  }
}

// This selector is made to stop any changes in shopify model that 
// do not affect the query runner from causing any re-renders, in 
// consumer components. 
// This can be seen by uncommenting the logs and observing that 
// all selector input evaluated logs do not lead to a query selector evaluated 
// log and subsequently stop any re-renders
const queryRunnerSelector = createSelector(
  [(state) => {
    console.log("selector input evaluated")
    const dsModel = datasourceTypeModelSel(state, 'shopifyV_22_10')
    const runner = dsModel?.get("queryRunner") || null;
    if (dsModel) {
      if (queryRunner !== runner) {
        queryRunner = runner;
      }
    }
    return queryRunner;
  }],
  queryRunner => {
    console.log("queryRunner selector evaluated")
    return queryRunner;
  }
)

// This one will only look at the store when the add to cart is triggered 
// instead of trying to update what the function does reactively. This is 
// probably cheaper than incurring the cost of constantly updating the 
// addToCart function in every component as the store updates.
export async function addLineItemToCart(productId) {
  console.log("adding item to cart: ", productId)
  const state = store.getState();
  const globalPluginConfigs = globalPluginsSelector(state);
  const appConfig = selectAppConfig(state);
  const appModel = selectAppModel(state);
  const shopifyCartDSModel = datasourceTypeModelSel(state, 'shopifyCart');
  const addCartLineItem = shopifyCartDSModel?.get('addCartLineItem');
  if (addCartLineItem) {
    return addCartLineItem(
      store.dispatch,
      globalPluginConfigs.get('shopifyCart'),
      shopifyCartDSModel,
      ['shopifyCart'],
      {
        quantity: 1,
        merchandiseId: productId,
        syncWithShopify: true,
        successToastText: 'Item added to cart'
      },
      appConfig,
      appModel
    )
  } else {
    console.error("Could not add item to cart because model did not return addCartLineItem function");
  } 
}

const quantitySelector = createSelector(
  state => datasourceTypeModelSel(state, "shopifyCart"),
  (shopifyCart) => {
    let numCurrentCartItems = 0;
    if (shopifyCart && shopifyCart.get && shopifyCart.get.call) {
      numCurrentCartItems = shopifyCart.get("currentCart")?.totalQuantity ?? 0;
    }
    return numCurrentCartItems;
  }
);

export function useCartQuantity() {
  const numCurrentCartItems = useSelector(quantitySelector, shallowEqual);
  return numCurrentCartItems;
}