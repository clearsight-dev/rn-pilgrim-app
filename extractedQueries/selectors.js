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

export function useShopifyQueryRunner() {
  const queryRunner = useSelector(queryRunnerSelector, shallowEqual);
  console.log("Query runner: ", queryRunner);
  return queryRunner;
}

export function useShopifyQueryAndAddtoCart() {
  const dispatch = useDispatch();
  const globalPluginsConfigs = useSelector(globalPluginsSelector);
  const appConfig = useSelector(selectAppConfig);
  const appModel = useSelector(selectAppModel);

  const results = useSelector(state => {
    const shopifyDSModel = datasourceTypeModelSel(state, 'shopifyV_22_10');
    const shopifyCartDSModel = datasourceTypeModelSel(state, 'shopifyCart');
    const queryRunner = shopifyDSModel?.get('queryRunner');
    
    const addCartLineItem = shopifyCartDSModel?.get('addCartLineItem');

    let addLineItemToCart = () => console.error("Cannot add to cart yet!");
    if (addCartLineItem) {
      addLineItemToCart = async (productId) => {
        return addCartLineItem(
          dispatch, 
          globalPluginsConfigs.get('shopifyCart'),
          shopifyCartDSModel,
          ['shopifyCart'],
          {
            quantity: 1,
            merchandiseId: productId,
            syncWithShopify: true, 
            successToastText: '', 
          },
          appConfig,
          appModel
        )
        .then(() => {
          console.log("Added to cart!");
        })
        .catch(err => {
          console.error("Failed to add to cart!", err);
        });
      };
    }

    return {queryRunner, addLineItemToCart};
  }, shallowEqual);
  return results;
}

export function useCartIconData() {
  const dispatch = useDispatch();
  const globalPluginsConfigs = useSelector(globalPluginsSelector);
  const appConfig = useSelector(selectAppConfig);
  const appModel = useSelector(selectAppModel);

  const result = useSelector(state => {
    let numCurrentCartItems = 0;
    let clearCart = async () => console.log("Cannot clear the cart yet!");

    const shopifyDS = datasourceTypeModelSel(state, "shopifyCart");
    const cartLineCache = shopifyDS?.get('cartLineCache');;

    if (cartLineCache && !cartLineCache.then && typeof cartLineCache === "object") {
      numCurrentCartItems = Object.keys(cartLineCache).length || 0;
    //   const clearCartAction = shopifyDS?.get('clearCart')
    //   if (clearCartAction) {
    //     clearCart = async () => {
    //       return clearCartAction(
    //         dispatch, 
    //         globalPluginsConfigs.get('shopifyCart'),
    //         shopifyDS,
    //         ['shopifyCart'],
    //         {},
    //         appConfig,
    //         appModel
    //       )
    //       .then(() => {
    //         console.log("Added to cart!");
    //       })
    //       .catch(err => {
    //         console.error("Failed to add to cart!", err);
    //       });
    //     };
    //   }
    }

    return {numCurrentCartItems, clearCart};
  })
  
  return result;
}