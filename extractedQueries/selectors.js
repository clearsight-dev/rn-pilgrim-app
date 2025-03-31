import {useSelector, shallowEqual, useDispatch} from 'react-redux';
import { datasourceTypeModelSel, selectAppConfig, selectAppModel, globalPluginsSelector } from 'apptile-core';

export function useShopifyQueryRunner() {
  const queryRunner = useSelector(state => {
    const shopifyDSModel = datasourceTypeModelSel(state, 'shopifyV_22_10');
    const queryRunner = shopifyDSModel?.get('queryRunner');
    return queryRunner;
  }, shallowEqual);
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

    debugger
    const shopifyDS = datasourceTypeModelSel(state, "shopifyCart");
    const cartLineCache = shopifyDS?.get('cartLineCache');;

    if (cartLineCache && !cartLineCache.then && typeof cartLineCache === "object") {
      numCurrentCartItems = Object.keys(cartLineCache).length || 0;
    //   const clearCartAction = shopifyDS?.get('clearCart')
    //   if (clearCartAction) {
    //     clearCart = async () => {
    //       debugger
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