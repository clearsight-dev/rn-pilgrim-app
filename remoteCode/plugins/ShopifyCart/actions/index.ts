import _ from 'lodash';
import {
  ActionHandler,
  PluginConfig,
  modelUpdateAction,
  LocalStorage,
  Selector,
  GetRegisteredPluginInfo,
} from 'apptile-core';
import {queryDetails, makeInputParamsResolver} from '../source/widget';
import {processShopifyGraphqlQueryResponse} from 'apptile-core';

import {
  CART_KEY_FOR_LOCAL_STORAGE_KEY,
  CART_OBJECT_KEY,
  CART_LINE_CACHE_KEY,
  ENABLE_CART_LINE_CACHE_KEY,
  CART_SYNC_KEY,
  CART_PREPARE_KEY,
  SYNCING_LINE_ITEM_KEY,
  CART_LINE_ITEMS_MAP_KEY,
  ENABLE_CHECKOUT_SHEET_KEY,
  ENABLE_CHECKOUT_PRELOAD_KEY,
  ENABLE_PRE_CHECKOUT_VALIDATION,
  ENABLE_POST_CART_VALIDATION,
} from '../constants';

import {CartQueryRecords} from '../queryRecords';
import {Platform} from 'react-native';

import {shopifyCheckout} from '../checkout';

// [Note]: CartActions class handles cart operations including fetching, adding, updating, and removing cart items.
// TODO: Implement analytics
class CartActions {
  private getCart = model => model?.get(CART_OBJECT_KEY);
  private swapCart = null;

  // Local Storage Methods
  private getCartFromLS = (config: PluginConfig) =>
    config.config.get(CART_KEY_FOR_LOCAL_STORAGE_KEY);

  private storeCartObjectLocally = async (
    config: PluginConfig,
    cartObject: any,
  ) => {
    const cartLocalStorageKey = this.getCartFromLS(config);
    if (cartObject)
      await LocalStorage.setValue(cartLocalStorageKey, cartObject);
  };

  private removeCartObjectLocally = async (config: PluginConfig) => {
    const cartLocalStorageKey = this.getCartFromLS(config);
    await LocalStorage.removeKey(cartLocalStorageKey);
  };

  // Caching Methods
  private cacheCartLineItem = async (
    dispatch,
    config: PluginConfig,
    model,
    selector: Selector,
    merchandiseId: string,
    appConfig,
    appModel,
  ) => {
    let cartLineCache = model?.get(CART_LINE_CACHE_KEY) || {};
    try {
      if (_.has(cartLineCache, merchandiseId)) {
        return cartLineCache;
      }

      const transformedData = await this.fetchVariantData(
        appConfig,
        appModel,
        model,
        [merchandiseId],
      );
      const variantData = _.head(transformedData);
      if (variantData) {
        cartLineCache = {...cartLineCache, [merchandiseId]: variantData};
        dispatch(
          modelUpdateAction(
            [
              {
                selector: selector.concat([CART_LINE_CACHE_KEY]),
                newValue: cartLineCache,
              },
            ],
            undefined,
            true,
          ),
        );
      }

      return cartLineCache;
    } catch (err) {
      return cartLineCache;
    }
  };

  refreshCartLineCache = async (
    dispatch,
    config: PluginConfig,
    model,
    selector: Selector,
    params: any,
    appConfig,
    appModel,
  ) => {
    const isCacheEnabled = model?.get(ENABLE_CART_LINE_CACHE_KEY);
    const modelUpdates = [];

    dispatch(
      modelUpdateAction(
        [
          {
            selector: selector.concat([CART_PREPARE_KEY]),
            newValue: true,
          },
        ],
        undefined,
        true,
      ),
    );

    //* refreshing cart lines cache
    if (isCacheEnabled) {
      const cartLineCache = await this.getCartLineCache(
        model,
        appConfig,
        appModel,
      );
      const cartObject = this.getCart(model);
      const cartLineItemsMap = this.getCartLineItemsMap(cartObject);

      modelUpdates.push(
        {
          selector: selector.concat([CART_LINE_CACHE_KEY]),
          newValue: cartLineCache,
        },
        {
          selector: selector.concat([CART_LINE_ITEMS_MAP_KEY]),
          newValue: cartLineItemsMap,
        },
      );
    }

    modelUpdates.push({
      selector: selector.concat([CART_PREPARE_KEY]),
      newValue: false,
    });

    if (!_.isEmpty(modelUpdates)) {
      dispatch(modelUpdateAction(modelUpdates, undefined, true));
    }
  };

  getCartLineCache = async (model, appConfig, appModel) => {
    let cartLineCache = {};
    const cartObject = this.getCart(model);
    const lineItems = _.get(cartObject, 'lines', []).map(entry => {
      return {
        merchandiseId: _.get(entry, 'variant.id'),
        quantity: _.get(entry, 'quantity'),
        itemPrice: _.get(entry, 'variant.salePrice'),
        productId: _.get(entry, 'variant.product.id'),
        collections: _.get(entry, 'variant.product.collections'),
      };
    });

    if (!_.isEmpty(lineItems)) {
      const variantIds = _.uniq(
        _.map(lineItems, entry => entry?.merchandiseId),
      );
      const transformedData = await this.fetchVariantData(
        appConfig,
        appModel,
        model,
        variantIds,
      );
      cartLineCache = _.transform(
        transformedData ?? [],
        (result, entry) => {
          _.set(result, entry?.id, entry);
        },
        {},
      );
    }

    return cartLineCache;
  };

  private async fetchVariantData(appConfig, appModel, model, variantIds) {
    const shopifyDataSourceConfig = GetRegisteredPluginInfo('shopifyV_22_10');
    const queries = shopifyDataSourceConfig?.plugin?.getQueries();
    const getVariantsQuery = queries?.GetVariantByIds;
    const queryInput = {variantIds: variantIds};

    const response = await this.queryExecutor(
      appConfig,
      appModel,
      model,
      getVariantsQuery,
      queryInput,
    );
    return response?.transformedData;
  }

  // Verification Methods
  private validateCartLineItemsRules = async (
    dispatch: any,
    config: PluginConfig,
    model: any,
    selector: Selector,
    appConfig: any,
    appModel: any,
    cartObject: any,
    lineItemToAdd: any,
    cartLineCache,
    verifyMode: boolean = false,
  ) => {
    let isLineItemSatisfyRules = true;

    const orderLimiterDataSourceId = model?.get('orderLimiterDatasourceId');
    const OrderLimiterDSModel = appModel?.getModelValue([
      orderLimiterDataSourceId,
    ]);
    const isCartSatisfyOrderLimit = OrderLimiterDSModel?.get(
      'isCartSatisfyOrderLimitV2',
    );

    if (isCartSatisfyOrderLimit) {
      isLineItemSatisfyRules = isCartSatisfyOrderLimit(
        dispatch,
        OrderLimiterDSModel,
        cartObject,
        verifyMode ? {} : lineItemToAdd,
        cartLineCache,
        verifyMode,
      );
    }

    return isLineItemSatisfyRules;
  };

  private isCartModifiable = model => {
    const isCartSyncing = model?.get(CART_SYNC_KEY);
    const isCartPreparing = model?.get(CART_PREPARE_KEY);

    const cartPlatformId = model?.get('cartPlatform');
    let isCartReadyForChange = true;

    if (_.isEmpty(cartPlatformId) || isCartPreparing || isCartSyncing) {
      isCartReadyForChange = false;
    }

    return isCartReadyForChange;
  };

  // Utility Methods
  private getCartLineItemsMap = cartObject => {
    const cartLineItems = _.get(cartObject, 'lines', []);
    const cartLineMap = {};

    cartLineItems.forEach(entry => {
      const merchandiseId = _.get(entry, 'variant.id');
      const currentItemQuantity = _.get(
        cartLineMap,
        [merchandiseId, 'quantity'],
        0,
      );
      _.set(cartLineMap, merchandiseId, {
        quantity: currentItemQuantity + _.get(entry, 'quantity', 0),
      });
    });

    return cartLineMap;
  };

  private getMatchingLineItem = (
    model,
    merchandiseId: string,
    sellingPlanId?: string,
    cartLineId?: string,
  ) => {
    const currentCart = this.getCart(model);
    const cartLineItems = _.get(currentCart, 'lines', []);

    if (!_.isEmpty(cartLineId)) {
      return (
        _.find(cartLineItems, entry => entry?.cartLineId === cartLineId) ?? {}
      );
    }

    // ![Implement] Check selling plan id
    // if (!_.isEmpty(sellingPlanId)) {
    //   return _.find(cartLineItems, entry => entry?.variant?.id === merchandiseId) ?? {};
    // }

    return (
      _.find(cartLineItems, entry => entry?.variant?.id === merchandiseId) ?? {}
    );
  };

  // Sync Manager Methods
  private addLineItemToSyncManager = (
    model,
    merchandiseId: string,
    cartLineId?: string,
  ) => {
    const syncManager = model?.get(SYNCING_LINE_ITEM_KEY);
    const recreateSyncManager = Object.assign({}, syncManager ?? {});

    _.set(recreateSyncManager, merchandiseId, {
      cartLineId,
      status: 'SYNCING',
    });

    return recreateSyncManager;
  };

  private removeLineItemFromSyncManager = (model, merchandiseId: string) => {
    const syncManager = model?.get(SYNCING_LINE_ITEM_KEY);
    const recreateSyncManager = Object.assign({}, syncManager ?? {});

    _.unset(recreateSyncManager, merchandiseId);

    return recreateSyncManager;
  };

  // Loading Methods
  private startLoading(dispatch, selector, model) {
    const modelUpdates = [
      {selector: selector.concat([CART_SYNC_KEY]), newValue: true},
    ];
    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  }

  private startLoadingAndAddItemToSync(
    dispatch,
    selector,
    model,
    merchandiseId: string,
  ) {
    const syncManager = this.addLineItemToSyncManager(model, merchandiseId);
    const modelUpdates = [
      {selector: selector.concat([CART_SYNC_KEY]), newValue: true},
      {
        selector: selector.concat([SYNCING_LINE_ITEM_KEY]),
        newValue: syncManager,
      },
    ];
    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  }

  private completeLoading = (dispatch, selector, model) => {
    const modelUpdates = [
      {selector: selector.concat([CART_SYNC_KEY]), newValue: false},
    ];
    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  };

  private completeLoadingAndRemoveItemFromSync = (
    dispatch,
    selector,
    model,
    merchandiseId,
  ) => {
    const syncingLineItems = this.removeLineItemFromSyncManager(
      model,
      merchandiseId,
    );
    const modelUpdates = [
      {selector: selector.concat([CART_SYNC_KEY]), newValue: false},
      {
        selector: selector.concat([SYNCING_LINE_ITEM_KEY]),
        newValue: syncingLineItems,
      },
    ];
    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  };

  // Model Update Methods
  private finalizeModelUpdates(dispatch, selector, model, cartObject) {
    const cartLineItemsMap = this.getCartLineItemsMap(cartObject);

    const modelUpdates = [
      {
        selector: selector.concat([CART_LINE_ITEMS_MAP_KEY]),
        newValue: cartLineItemsMap,
      },
      {selector: selector.concat([CART_SYNC_KEY]), newValue: false},
    ];

    // This prevent clearing of existing cart due to some unexpected issues.
    if (!_.isEmpty(cartObject)) {
      modelUpdates.push({
        selector: selector.concat([CART_OBJECT_KEY]),
        newValue: cartObject,
      });
    }

    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  }

  private finalizeModelUpdatesAndRemoveItemFromSync(
    dispatch,
    selector,
    model,
    merchandiseId,
    cartObject,
  ) {
    const cartLineItemsMap = this.getCartLineItemsMap(cartObject);
    const modelUpdates = [
      {
        selector: selector.concat([CART_LINE_ITEMS_MAP_KEY]),
        newValue: cartLineItemsMap,
      },
      {
        selector: selector.concat([SYNCING_LINE_ITEM_KEY]),
        newValue: this.removeLineItemFromSyncManager(model, merchandiseId),
      },
      {selector: selector.concat([CART_SYNC_KEY]), newValue: false},
    ];

    // This prevent clearing of existing cart due to some unexpected issues.
    if (!_.isEmpty(cartObject)) {
      modelUpdates.push({
        selector: selector.concat([CART_OBJECT_KEY]),
        newValue: cartObject,
      });
    }
    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  }

  // Main Execution Method
  private executeCartQuery = async (
    model,
    query,
    inputs: any,
    appConfig,
    appModel,
    _cartId?: string,
  ) => {
    try {
      let result;

      const currentCart = this.getCart(model);
      const cartId = _cartId || currentCart?.id;
      const cartPlatformId = model?.get('cartPlatform');
      const cartPlatformDSModel = appModel?.getModelValue([cartPlatformId]);
      const customerAccessToken = cartPlatformDSModel?.getIn([
        'loggedInUserAccessToken',
        'accessToken',
      ]);

      switch (query) {
        case 'CREATE':
          result = await this.queryExecutor(
            appConfig,
            appModel,
            model,
            CartQueryRecords.CreateCart,
            Object.assign({}, {customerAccessToken}, inputs),
          );
          break;
        case 'GET_CART':
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.GetCart,
              Object.assign({}, {cartId}, inputs),
            );
          }
          break;
        case 'ADD_LINE_ITEMS':
          let lineItemsToAdd = _.get(inputs, 'lines', []).map(entry => {
            return {
              merchandiseId: entry.merchandiseId,
              sellingPlanId: entry.sellingPlanId,
              quantity: _.isNil(entry.quantity) ? 1 : entry.quantity,
              attributes: _.isEmpty(entry.attributes) ? [] : entry.attributes,
            };
          });
          result = cartId
            ? await this.queryExecutor(
                appConfig,
                appModel,
                model,
                CartQueryRecords.CartLinesAdd,
                {
                  cartId,
                  lines: lineItemsToAdd,
                },
              )
            : await this.executeCartQuery(
                model,
                'CREATE',
                {
                  lines: lineItemsToAdd,
                },
                appConfig,
                appModel,
              );
          break;
        case 'UPDATE_LINE_ITEMS':
          const lineItemsToUpdate = _.get(inputs, 'lines', []).map(entry => {
            return {
              id: entry.id,
              merchandiseId: entry.merchandiseId,
              sellingPlanId: entry.sellingPlanId,
              quantity: entry.quantity,
              attributes: _.isEmpty(entry.attributes) ? [] : entry.attributes,
            };
          });
          result = cartId
            ? await this.queryExecutor(
                appConfig,
                appModel,
                model,
                CartQueryRecords.CartLinesUpdate,
                {
                  cartId,
                  lines: lineItemsToUpdate,
                },
              )
            : await this.executeCartQuery(
                model,
                'CREATE',
                {
                  lines: lineItemsToUpdate,
                },
                appConfig,
                appModel,
              );
          break;
        case 'REMOVE_LINE_ITEMS':
          const linesItemsToRemove = _.get(inputs, 'lines', []).map(
            entry => entry?.id,
          );
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.CartLinesRemove,
              {
                cartId,
                lineIds: linesItemsToRemove,
              },
            );
          }
          break;
        case 'UPDATE_DISCOUNTS':
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.CartDiscountUpdate,
              Object.assign({}, {cartId}, inputs),
            );
          }
          break;
        case 'UPDATE_GIFT_CARD_CODES':
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.CartGiftCartUpdate,
              Object.assign({}, {cartId}, inputs),
            );
          }
          break;
        case 'UPDATE_BUYER_IDENTITY':
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.CartBuyerIdentityUpdate,
              Object.assign({}, {cartId, customerAccessToken}, inputs),
            );
          }
          break;
        case 'UPDATE_ATTRIBUTES':
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.CartAttributesUpdate,
              Object.assign({}, {cartId}, inputs),
            );
          }

          break;
        case 'UPDATE_NOTE':
          if (cartId) {
            result = await this.queryExecutor(
              appConfig,
              appModel,
              model,
              CartQueryRecords.CartNoteUpdate,
              Object.assign({}, {cartId}, inputs),
            );
          }
          break;
        default:
          throw new Error(`${query} cart query is not defined`);
      }

      if (
        !_.isEmpty(result?.transformedError) &&
        model?.get('showShopifyCartErrorMessage')
      ) {
        toast.show(
          _.get(
            _.head(result?.transformedError) as Record<string, any>,
            'message',
          ),
          {
            type: 'error',
            placement: 'bottom',
            duration: 2000,
            style: {marginBottom: 80},
          },
        );
      }

      return result;
    } catch (error) {
      console.error(`Error executing cart ${query}`, error);
    }
  };

  private queryExecutor = async (
    appConfig,
    appModel,
    pluginModel: any,
    querySchema: queryDetails,
    inputVariables: any,
  ) => {
    const input = querySchema.inputResolver
      ? querySchema.inputResolver(inputVariables)
      : inputVariables;
    const cartPlatformId = pluginModel?.get('cartPlatform');
    const cartPlatformDSModel = appModel?.getModelValue([cartPlatformId]);
    const queryRunner = cartPlatformDSModel.get('queryRunner');
    const shopConfig = cartPlatformDSModel.get('shop');

    let contextInputParam;
    if (querySchema && querySchema.contextInputParams) {
      const contextInputParamResolve = makeInputParamsResolver(
        querySchema.contextInputParams,
      );
      contextInputParam = contextInputParamResolve(cartPlatformDSModel);
    }

    const response = await queryRunner.runQuery(
      querySchema.queryType,
      querySchema.gqlTag,
      {...input, ...contextInputParam},
      {},
    );
    const tResponse = processShopifyGraphqlQueryResponse(
      response,
      querySchema,
      shopConfig,
      pluginModel,
    );
    return tResponse;
  };

  // Post Actions
  private postCartActions = async (
    dispatch,
    config,
    model,
    selector: Selector,
    params: any,
    appConfig,
    appModel,
    incomingCartObject,
    cartLineCache,
    forceCheckoutPreload = false,
  ) => {
    const handleError = _error => {
      dispatch(
        modelUpdateAction(
          [{selector: selector.concat([CART_SYNC_KEY]), newValue: false}],
          undefined,
          true,
        ),
      );
    };

    const isCartSyncing = model?.get(CART_SYNC_KEY);
    try {
      cartLineCache = cartLineCache ?? model?.get(CART_LINE_CACHE_KEY);
      const freeGiftDataSourceId = model?.get('freeGiftDatasourceId');
      const freeGiftDSModel = appModel?.getModelValue([freeGiftDataSourceId]);
      const adjustCartGifts = freeGiftDSModel?.get(
        'attachFreebieToCartLineItems',
      );
      const isCartPreparing = model?.get(CART_PREPARE_KEY);
      const isPostCartValidationEnabled = model?.get(
        ENABLE_POST_CART_VALIDATION,
      );
      const modelUpdates = [];
      let postProcessedCartObject;
      if (adjustCartGifts) {
        if (isCartPreparing || isCartSyncing) {
          return;
        }

        this.startLoading(dispatch, selector, model);
        const {giftsToAdd, giftsToRemove} = adjustCartGifts(
          freeGiftDSModel,
          incomingCartObject,
          cartLineCache,
        );

        if (!_.isEmpty(giftsToAdd)) {
          const lineResponse = await this.executeCartQuery(
            model,
            'ADD_LINE_ITEMS',
            {
              lines: giftsToAdd,
            },
            appConfig,
            appModel,
            incomingCartObject.id,
          );

          postProcessedCartObject = lineResponse.transformedData;
        }
        if (!_.isEmpty(giftsToRemove)) {
          const lineResponse = await this.executeCartQuery(
            model,
            'REMOVE_LINE_ITEMS',
            {
              lines: giftsToRemove,
            },
            appConfig,
            appModel,
            incomingCartObject.id,
          );
          postProcessedCartObject = lineResponse.transformedData;
        }

        if (!_.isEmpty(postProcessedCartObject)) {
          const cartLineItemsMap = this.getCartLineItemsMap(
            postProcessedCartObject,
          );

          modelUpdates.push({
            selector: selector.concat([CART_LINE_ITEMS_MAP_KEY]),
            newValue: cartLineItemsMap,
          });

          modelUpdates.push({
            selector: selector.concat([CART_OBJECT_KEY]),
            newValue: postProcessedCartObject,
          });
          this.storeCartObjectLocally(config, postProcessedCartObject);
        }

        modelUpdates.push({
          selector: selector.concat([CART_SYNC_KEY]),
          newValue: false,
        });

        dispatch(modelUpdateAction(modelUpdates, undefined, true));
      }

      const finalizedCartObject = !_.isEmpty(postProcessedCartObject)
        ? postProcessedCartObject
        : incomingCartObject;
      let isMalfunctionedCartDetected = false;

      if (isPostCartValidationEnabled) {
        let isFreeGiftInCartStatisfyRules = true;
        const linesToProcess = finalizedCartObject?.lines || [];

        //! Check whether multiple quantity of free gift is added
        isFreeGiftInCartStatisfyRules = !_.some(linesToProcess, item => {
          const isFreeProduct = _.find(item.attributes || [], {
            key: 'apptile_free_product',
            value: 'true',
          });

          if (item.quantity > 1 && isFreeProduct) {
            logger.info('Marker Free Gift Multiple Quantity Detected');
            return true;
          }

          return false;
        });

        //! Check whether free gift is added in full price
        isFreeGiftInCartStatisfyRules = !_.some(linesToProcess, item => {
          const isFreeProduct = _.find(item.attributes || [], {
            key: 'apptile_free_product',
            value: 'true',
          });
          const finalPrice = _.round(
            item.quantity * item.variant.salePrice - item.lineItemDiscount,
            2,
          );

          if (isFreeProduct && finalPrice > 0) {
            logger.info('Marker Free Gift is Added In Full Price');
            return true;
          }

          return false;
        });

        //! Clearing cart in case of misbehave
        if (!isFreeGiftInCartStatisfyRules) {
          isMalfunctionedCartDetected = true;
          await this.clearCart(
            dispatch,
            config,
            model,
            selector,
            {},
            appConfig,
            appModel,
          );
        }
      }

      if (isMalfunctionedCartDetected) return;
      this.preloadCheckout(model, finalizedCartObject, forceCheckoutPreload);
    } catch (err) {
      handleError(err);
    }
  };

  // Operation handlers
  addLineItem = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {attributes, quantity, merchandiseId, sellingPlanId, itemPrice} =
        params;
      const lineItems = [];

      const currentCart = this.getCart(model);
      const cartId = currentCart?.id;
      const isCacheEnabled = model?.get(ENABLE_CART_LINE_CACHE_KEY);

      let cartLineCache;
      let cartObject;

      if (_.isEmpty(merchandiseId)) {
        console.error(`Invalid merchandiseId provided: ${merchandiseId}`);
        return;
      }

      if (isCacheEnabled) {
        cartLineCache = await this.cacheCartLineItem(
          dispatch,
          config,
          model,
          selector,
          merchandiseId,
          appConfig,
          appModel,
        );
      }

      const lineItemToAdd = {
        merchandiseId,
        sellingPlanId,
        quantity: _.isNil(quantity) ? 1 : quantity,
        attributes: _.isEmpty(attributes) ? [] : attributes,
      };
      lineItems.push(lineItemToAdd);

      if (cartId) {
        const isCartLinesValid = await this.validateCartLineItemsRules(
          dispatch,
          config,
          model,
          selector,
          appConfig,
          appModel,
          currentCart,
          {...lineItemToAdd, itemPrice},
          cartLineCache,
        );

        if (!isCartLinesValid) return;
      }

      this.startLoadingAndAddItemToSync(
        dispatch,
        selector,
        model,
        merchandiseId,
      );

      const {transformedData} = await this.executeCartQuery(
        model,
        'ADD_LINE_ITEMS',
        {
          lines: lineItems,
        },
        appConfig,
        appModel,
      );

      cartObject = transformedData;

      this.finalizeModelUpdatesAndRemoveItemFromSync(
        dispatch,
        selector,
        model,
        merchandiseId,
        cartObject,
      );
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        cartLineCache,
      );
    } catch (err) {
      const {merchandiseId} = params;
      this.completeLoadingAndRemoveItemFromSync(
        dispatch,
        selector,
        model,
        merchandiseId,
      );
      console.error(`Error executing cart addLineItem`, err);
    }
  };

  updateLineItem = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      // Method to be used for value manipulation. Can be either 'INCREMENT' or 'DECREMENT'.
      const {
        attributes,
        quantity,
        merchandiseId,
        sellingPlanId,
        itemPrice,
        id,
        method = 'INCREMENT',
      } = params;

      const currentCart = this.getCart(model);
      const isCacheEnabled = model?.get(ENABLE_CART_LINE_CACHE_KEY);
      const cartId = currentCart?.id;

      const lineItems = [];
      const defaultQuantity = 1;

      let cartObject;
      let cartLineCache;

      if (_.isEmpty(merchandiseId)) {
        console.error(`Invalid merchandiseId provided: ${merchandiseId}`);
        return;
      }

      if (isCacheEnabled) {
        cartLineCache = await this.cacheCartLineItem(
          dispatch,
          config,
          model,
          selector,
          merchandiseId,
          appConfig,
          appModel,
        );
      }

      if (cartId && method === 'INCREMENT') {
        const isCartLinesValid = await this.validateCartLineItemsRules(
          dispatch,
          config,
          model,
          selector,
          appConfig,
          appModel,
          currentCart,
          {
            quantity: _.isNil(quantity) ? 1 : quantity,
            attributes: _.isEmpty(attributes) ? [] : attributes,
            merchandiseId,
            sellingPlanId,
            itemPrice,
            id,
          },
          cartLineCache ?? model?.get(CART_LINE_CACHE_KEY),
        );

        if (!isCartLinesValid) return;
      }

      this.startLoadingAndAddItemToSync(
        dispatch,
        selector,
        model,
        merchandiseId,
      );

      const matchingLineItem = this.getMatchingLineItem(
        model,
        merchandiseId,
        sellingPlanId,
        id,
      );
      if (_.isEmpty(matchingLineItem)) {
        console.warn(
          `No matching line item found for merchandiseId: ${merchandiseId}`,
        );
        return;
      }

      lineItems.push({
        id: _.get(matchingLineItem, 'id'),
        merchandiseId: _.get(matchingLineItem, 'variant.id'),
        sellingPlanId: _.get(matchingLineItem, 'subscriptionProduct.id'),
        quantity:
          method === 'INCREMENT'
            ? _.get(matchingLineItem, 'quantity') +
              (quantity || defaultQuantity)
            : _.get(matchingLineItem, 'quantity') -
              (quantity || defaultQuantity),
        attributes: _.isEmpty(attributes) ? [] : attributes,
      });

      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_LINE_ITEMS',
        {
          lines: lineItems,
        },
        appConfig,
        appModel,
      );

      cartObject = transformedData;

      this.finalizeModelUpdatesAndRemoveItemFromSync(
        dispatch,
        selector,
        model,
        merchandiseId,
        cartObject,
      );
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        cartLineCache,
      );
    } catch (err) {
      const {merchandiseId} = params;
      this.completeLoadingAndRemoveItemFromSync(
        dispatch,
        selector,
        model,
        merchandiseId,
      );
      console.error(`Error executing cart updateLineItem`, err);
    }
  };

  increaseLineItemQuantity = async (...args) => {
    try {
      const [
        dispatch,
        _config,
        model,
        selector,
        params,
        _appConfig,
        _appModel,
      ] = args;

      await this.updateLineItem(
        dispatch,
        _config,
        model,
        selector,
        {...params, method: 'INCREMENT'},
        _appConfig,
        _appModel,
      );
    } catch (err) {
      console.error('Error occurred while adding line item to cart', err);
    }
  };

  decreaseLineItemQuantity = async (...args) => {
    try {
      const [
        dispatch,
        _config,
        model,
        selector,
        params,
        _appConfig,
        _appModel,
      ] = args;
      await this.updateLineItem(
        dispatch,
        _config,
        model,
        selector,
        {...params, method: 'DECREMENT'},
        _appConfig,
        _appModel,
      );
    } catch (err) {
      console.error('Error occurred while adding line item to cart', err);
    }
  };

  removeLineItem = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {merchandiseId, sellingPlanId, id} = params;
      const currentCart = this.getCart(model);

      const cartId = currentCart?.id;
      const lineItems = [];

      let cartObject;

      if (_.isEmpty(merchandiseId)) {
        console.error(`Invalid merchandiseId provided: ${merchandiseId}`);
        return;
      }

      if (_.isEmpty(cartId)) {
        console.error(`Invalid cart to perform line item removal action`);
        return;
      }

      const matchingLineItem = this.getMatchingLineItem(
        model,
        merchandiseId,
        sellingPlanId,
        id,
      );
      if (_.isEmpty(matchingLineItem)) {
        console.warn(
          `No matching line item found for merchandiseId: ${merchandiseId}`,
        );
        return;
      }

      lineItems.push(matchingLineItem);
      this.startLoadingAndAddItemToSync(
        dispatch,
        selector,
        model,
        merchandiseId,
      );
      const {transformedData} = await this.executeCartQuery(
        model,
        'REMOVE_LINE_ITEMS',
        {
          lines: lineItems,
        },
        appConfig,
        appModel,
      );
      cartObject = transformedData;

      this.finalizeModelUpdatesAndRemoveItemFromSync(
        dispatch,
        selector,
        model,
        merchandiseId,
        cartObject,
      );
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
      );
    } catch (err) {
      const {merchandiseId} = params;
      this.completeLoadingAndRemoveItemFromSync(
        dispatch,
        selector,
        model,
        merchandiseId,
      );
      console.error(`Error executing cart removeLineItem`, err);
    }
  };

  clearCart = async (
    dispatch,
    config,
    model,
    selector: Selector,
    params: any,
    appConfig,
    appModel,
  ) => {
    const isCartModifiable = this.isCartModifiable(model);
    if (!isCartModifiable) return;

    await this.removeCartObjectLocally(config);
    this.swapCart = null;

    const modelUpdates = [
      {
        selector: selector.concat(CART_OBJECT_KEY),
        newValue: '',
      },
      {
        selector: selector.concat(CART_LINE_CACHE_KEY),
        newValue: '',
      },
      {
        selector: selector.concat(CART_LINE_ITEMS_MAP_KEY),
        newValue: '',
      },
    ];

    dispatch(modelUpdateAction(modelUpdates, undefined, true));
  };

  refreshCart = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const currentCart = this.getCart(model);

      const cartId = currentCart?.id;
      let cartObject;

      if (_.isEmpty(cartId)) {
        return;
      }

      this.startLoading(dispatch, selector, model);
      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_BUYER_IDENTITY',
        {},
        appConfig,
        appModel,
      );
      cartObject = transformedData;

      this.finalizeModelUpdates(dispatch, selector, model, cartObject);
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
      );
    } catch (err) {
      this.completeLoading(dispatch, selector, model);
      console.error(`Error executing cart refreshCart`, err);
    }
  };

  updateGiftCards = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {giftCardCodes} = params;

      const currentCart = this.getCart(model);
      const cartId = currentCart?.id;

      let cartObject;

      if (_.isEmpty(cartId)) {
        return;
      }

      this.startLoading(dispatch, selector, model);
      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_GIFT_CARD_CODES',
        {
          giftCardCodes,
        },
        appConfig,
        appModel,
      );

      cartObject = transformedData;

      this.finalizeModelUpdates(dispatch, selector, model, cartObject);
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
        true,
      );
    } catch (err) {
      this.completeLoading(dispatch, selector, model);
      console.error(`Error executing cart gift cards`, err);
    }
  };

  updateDiscounts = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {discountCodes} = params;

      const currentCart = this.getCart(model);
      const cartId = currentCart?.id;

      let cartObject;

      if (_.isEmpty(cartId)) {
        return;
      }

      this.startLoading(dispatch, selector, model);
      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_DISCOUNTS',
        {
          discountCodes,
        },
        appConfig,
        appModel,
      );

      cartObject = transformedData;

      this.finalizeModelUpdates(dispatch, selector, model, cartObject);
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
        true,
      );
    } catch (err) {
      this.completeLoading(dispatch, selector, model);
      console.error(`Error executing cart updateDiscounts`, err);
    }
  };

  updateAttributes = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {attributes} = params;

      const currentCart = this.getCart(model);
      const cartId = currentCart?.id;

      let cartObject;

      if (_.isEmpty(cartId)) {
        return;
      }

      this.startLoading(dispatch, selector, model);
      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_ATTRIBUTES',
        {
          attributes,
        },
        appConfig,
        appModel,
      );

      cartObject = transformedData;

      this.finalizeModelUpdates(dispatch, selector, model, cartObject);
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
        true,
      );
    } catch (err) {
      this.completeLoading(dispatch, selector, model);
      console.error(`Error executing cart updateAttributes`, err);
    }
  };

  updateNote = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {note} = params;
      const currentCart = this.getCart(model);
      const cartId = currentCart?.id;

      let cartObject;
      if (_.isEmpty(cartId)) {
        return;
      }

      this.startLoading(dispatch, selector, model);
      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_NOTE',
        {
          note,
        },
        appConfig,
        appModel,
      );
      cartObject = transformedData;

      this.finalizeModelUpdates(dispatch, selector, model, cartObject);
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
        true,
      );
    } catch (err) {
      this.completeLoading(dispatch, selector, model);
      console.error(`Error executing cart updateNote`, err);
    }
  };

  updateBuyerIdentity = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    try {
      const isCartModifiable = this.isCartModifiable(model);
      if (!isCartModifiable) return;

      const {buyerIdentity} = params;

      const currentCart = this.getCart(model);
      const cartPlatformId = model?.get('cartPlatform');
      const cartId = currentCart?.id;
      let cartObject;

      if (_.isEmpty(cartPlatformId)) {
        return;
      }

      if (_.isEmpty(cartId)) {
        return;
      }

      this.startLoading(dispatch, selector, model);
      const {transformedData} = await this.executeCartQuery(
        model,
        'UPDATE_BUYER_IDENTITY',
        {
          buyerIdentity,
        },
        appConfig,
        appModel,
      );

      cartObject = transformedData;

      this.finalizeModelUpdates(dispatch, selector, model, cartObject);
      this.storeCartObjectLocally(config, cartObject);
      this.postCartActions(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
        cartObject,
        undefined,
        true,
      );
    } catch (err) {
      this.completeLoading(dispatch, selector, model);
      console.error(`Error executing cart updateBuyerIdentity`, err);
    }
  };

  // Checkout
  preloadCheckout = async (model, cartObject, forcePreload = true) => {
    const isCheckoutSheetEnabled = model?.get(ENABLE_CHECKOUT_SHEET_KEY);
    const isCheckoutPreloadEnabled = model?.get(ENABLE_CHECKOUT_PRELOAD_KEY);

    if (!isCheckoutSheetEnabled || !isCheckoutPreloadEnabled) {
      return;
    }

    const checkoutUrl = _.get(cartObject, 'checkoutUrl');
    let isCartUpdated = false;

    if (forcePreload) {
      isCartUpdated = true;
    }

    if (_.isEmpty(this.swapCart)) {
      isCartUpdated = true;
      this.swapCart = cartObject;
    }

    const swapCartLineItemMap = this.getCartLineItemsMap(this.swapCart);
    const recentCartLineItemMap = this.getCartLineItemsMap(cartObject);

    if (!_.isEqual(swapCartLineItemMap, recentCartLineItemMap)) {
      isCartUpdated = true;
    }

    this.swapCart = cartObject;

    if (checkoutUrl && Platform.OS !== 'web' && isCartUpdated) {
      logger.info('[Preloading checkout url]', checkoutUrl);
      shopifyCheckout.preload(checkoutUrl);
    }
  };

  initiateCheckout = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    const isCheckoutSheetEnabled = model?.get(ENABLE_CHECKOUT_SHEET_KEY);
    const isPreCheckoutValidationEnabled = model?.get(
      ENABLE_PRE_CHECKOUT_VALIDATION,
    );

    const {doBuyerIdentityUpdate} = params;
    if (_.isBoolean(doBuyerIdentityUpdate) && doBuyerIdentityUpdate) {
      logger.info('Force updating buyer identity in initiate checkout');
      await this.updateBuyerIdentity(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
      );
    }

    if (isPreCheckoutValidationEnabled) {
      const isCartValid = await this.validateCheckout(
        dispatch,
        config,
        model,
        selector,
        params,
        appConfig,
        appModel,
      );
      if (!isCartValid) {
        toast.show(`Unable to proceed to checkout due to invalid cart items.`, {
          type: 'info',
          placement: 'bottom',
          duration: 2000,
          style: {marginBottom: 80},
        });
        return;
      }
    }

    if (!isCheckoutSheetEnabled) {
      toast.show('Checkout sheet is disabled', {
        type: 'info',
        placement: 'bottom',
        duration: 2000,
        style: {marginBottom: 80},
      });
      return;
    }

    const currentCart = this.getCart(model);
    const checkoutUrl = _.get(currentCart, 'checkoutUrl');

    if (Platform.OS === 'web') {
      toast.show('Checkout will only works in mobile', {
        type: 'info',
        placement: 'bottom',
        duration: 2000,
        style: {marginBottom: 80},
      });

      return;
    }

    if (checkoutUrl) {
      logger.info('[Presenting checkout url]', checkoutUrl);
      shopifyCheckout.present(checkoutUrl);
    }
  };

  validateCheckout = async (
    dispatch,
    config,
    model,
    selector,
    params,
    appConfig,
    appModel,
  ) => {
    const cartObject = this.getCart(model);
    const cartLineCache = await this.getCartLineCache(
      model,
      appConfig,
      appModel,
    );

    return this.validateCartLineItemsRules(
      dispatch,
      config,
      model,
      selector,
      appConfig,
      appModel,
      cartObject,
      {},
      cartLineCache,
      true,
    );
  };
}

export interface CartActionInterface {
  addCartLineItem: ActionHandler;
}

const cartActions = new CartActions();
export default cartActions;
