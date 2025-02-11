import _ from 'lodash';

import {
  TriggerActionIdentifier,
  selectPluginConfig,
  GetRegisteredConfig,
  triggerAction,
  getAppDispatch,
  sendAnalyticsEvent,
  store,
  registerDatasource,
} from 'apptile-core';
import {baseDatasourceConfig} from 'apptile-core';
import {wrapDatasourceModel} from 'apptile-core';

import cartActions from '../actions';
import {
  CART_KEY_FOR_LOCAL_STORAGE_KEY, 
  ENABLE_CHECKOUT_SHEET_KEY, 
  ENABLE_CHECKOUT_PRELOAD_KEY
} from '../constants';
import {CartQueryRecords} from '../queryRecords';
import {call, select, spawn} from 'redux-saga/effects';
import {ApolloQueryRunner as apolloQueryRunner} from 'apptile-core';

import {initCartGenerator} from '../generators';
import {shopifyCheckout, transformPurchaseEvent} from '../checkout';

import {Platform} from 'react-native';

const pluginListing = {
  labelPrefix: 'shopifyCart',
  type: 'datasource',
  name: 'Shopify cart datasource',
  description: 'apptile shopifycart',
  section: 'SDK',
  icon: 'datasource',
  manifest: {
    directoryName: 'ShopifyCart',
  }
};

export const makeInputParamsResolver = (contextInputParams) => {
  return (modelValues) => {
    const dsPluginConfig = modelValues;
    if (!dsPluginConfig) return;

    let contextParams = Object.entries(contextInputParams).reduce((acc, [key, value]) => {
      if (dsPluginConfig && dsPluginConfig.get(value)) {
        return {...acc, [key]: dsPluginConfig.get(value)};
      }
      return acc;
    }, {});
    return contextParams;
  };
};

export const makeInputVariablesTypeCompatible = (inputVariables, editableInputParams) => {
  return Object.entries(inputVariables).reduce((acc, [key, value]) => {
    if (editableInputParams && editableInputParams[key] !== undefined) {
      if (typeof editableInputParams[key] === 'number') {
        return {
          ...acc,
          [key]: isNaN(value) && typeof value === typeof editableInputParams[key] ? value : parseInt(value),
        };
      } else {
        return value
          ? {
              ...acc,
              [key]: value,
            }
          : acc;
      }
    }
    return acc;
  }, {});
};

const apiRecords = {...CartQueryRecords};
const propertySettings = {
  addCartLineItem: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.addLineItem;
    },
    actionMetadata: {
      editableInputParams: {
        attributes: '{{[]}}',
        quantity: '',
        itemPrice: '',
        merchandiseId: '',
        sellingPlanId: '',
      },
    },
  },
  increaseLineItemQuantity: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.increaseLineItemQuantity;
    },
    actionMetadata: {
      editableInputParams: {
        id: '',
        attributes: '{{[]}}',
        quantity: '',
        itemPrice: '',
        merchandiseId: '',
        sellingPlanId: '',
      },
    },
  },
  decreaseLineItemQuantity: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.decreaseLineItemQuantity;
    },
    actionMetadata: {
      editableInputParams: {
        id: '',
        attributes: '{{[]}}',
        quantity: '',
        merchandiseId: '',
        sellingPlanId: '',
      },
    },
  },
  removeCartLineItem: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.removeLineItem;
    },
    actionMetadata: {
      editableInputParams: {
        id: '',
        merchandiseId: '',
        sellingPlanId: '',
      },
    },
  },
  clearCart: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.clearCart;
    },
  },
  refreshCart: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.refreshCart;
    },
  },
  updateCartDiscounts: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.updateDiscounts;
    },
    actionMetadata: {
      editableInputParams: {
        discountCodes: '{{[]}}',
      },
    },
  },
  updateCartAttributes: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.updateAttributes;
    },
    actionMetadata: {
      editableInputParams: {
        attributes: '',
      },
    },
  },
  updateCartNote: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.updateNote;
    },
    actionMetadata: {
      editableInputParams: {
        note: '',
      },
    },
  },
  updateCartBuyerIdentity: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.updateBuyerIdentity;
    },
    actionMetadata: {
      editableInputParams: {
        buyerIdentity: '{{{}}}',
      },
    },
  },
  refreshCartLineCache: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.refreshCartLineCache;
    },
  },
  initiateCheckout: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return cartActions.initiateCheckout;
    },
  },
};

export const editors = {
  basic: [
    {
      type: 'codeInput',
      name: 'cartPlatform',
      props: {
        label: 'Cart Platform ID',
        placeholder: 'shopify',
      },
    },
    {
      type: 'codeInput',
      name: CART_KEY_FOR_LOCAL_STORAGE_KEY,
      props: {
        label: 'Local storage key for storing cart object',
        placeholder: 'currentCartLS',
      },
    },
    {
      type: 'checkbox',
      name: ENABLE_CHECKOUT_SHEET_KEY,
      props: {
        label: 'Enable Checkout Sheet',
      },
    },
    {
      type: 'checkbox',
      name: ENABLE_CHECKOUT_PRELOAD_KEY,
      props: {
        label: 'Enable Checkout Preload',
      },
    },
  ],
  advanced: [
    {
      type: 'checkbox',
      name: 'enabledCartLineCache',
      props: {
        label: 'Enable CartLine Cache',
      },
    },
    {
      type: 'checkbox',
      name: 'enablePreCheckoutValidation',
      props: {
        label: 'Enable PreCheckout Validation',
      },
    },
    {
      type: 'checkbox',
      name: 'showShopifyCartErrorMessage',
      props: {
        label: 'Show Cart Error Message',
      },
    },
    {
      type: 'codeInput',
      name: 'freeGiftDatasourceId',
      props: {
        label: 'FreeGift Datasource ID',
        placeholder: 'freeGifts',
      },
    },
    {
      type: 'codeInput',
      name: 'freeGiftMetaobjectId',
      props: {
        label: 'FreeGift Metaobject ID',
      },
    },
    {
      type: 'codeInput',
      name: 'orderLimiterDatasourceId',
      props: {
        label: 'OrderLimiter Datasource ID',
        placeholder: 'orderlimiter',
      },
    },
  ],
};

const shopifyCartDS = wrapDatasourceModel({
  name: 'shopifyCart',
  config: {
    ...baseDatasourceConfig,
    cartPlatform: '',
    syncingCartStatus: false,
    cartLineCache: '',
    preparingCart: false,
    enabledCartLineCache: false,
    freeGiftDatasourceId: '',
    freeGiftMetaobjectId: '',
    orderLimiterDatasourceId: '',
    currentCart: '',
    addCartLineItem: 'action',
    increaseLineItemQuantity: 'action',
    decreaseLineItemQuantity: 'action',
    removeCartLineItem: 'action',
    currentCartLSKey: '',
    clearCart: 'action',
    refreshCart: 'action',
    updateCartDiscounts: 'action',
    updateCartAttributes: 'action',
    updateCartNote: 'action',
    updateCartBuyerIdentity: 'action',
    syncingLineItems: '',
    cartLineItemsMap: '',
    refreshCartLineCache: '',
    initiateCheckout: '',
    enableCheckoutSheet: false,
    enableCheckoutPreload: false,
    enablePreCheckoutValidation: false,
    showShopifyCartErrorMessage: false,
  },

  initDatasource: async (_dsModel, _dsConfig, _dsModelValues) => {},
  onPluginUpdate: function* (
    state,
    pluginId,
    pageKey,
    _instance,
    _userTriggered,
    pageLoad,
    _options,
  ) {
    const pluginConfig = yield select(selectPluginConfig, pageKey, pluginId);
    const configGen = GetRegisteredConfig(pluginConfig.get('subtype'));
    const mergedConfig = configGen(pluginConfig.config);
    const dsConfig = pluginConfig.set('config', mergedConfig);
    const cartPlatformId = dsConfig?.getIn(['config', 'cartPlatform']);

    if (pageLoad && !_.isEmpty(cartPlatformId)) {
      const cartPlatformConfig = yield select(selectPluginConfig, pageKey, cartPlatformId);
      const cartPlatformConfigGen = GetRegisteredConfig(cartPlatformConfig.get('subtype'));
      const cartPlatformMergedConfig = cartPlatformConfigGen(cartPlatformConfig.config);
      const cartPlatformDsConfig = cartPlatformConfig.set('config', cartPlatformMergedConfig);
      const dsModel = state.stageModel.getPluginModel(pageKey, pluginId);

      if (Platform.OS !== 'web') {
        const dispatch = getAppDispatch();
        shopifyCheckout.addEventListener('completed', event => {
          const currentState = store.getState();
          const isCustomerHasOrders = currentState.stageModel.getModelValue([cartPlatformId, 'isCustomerHasOrders']);
          const cartPlatformDsModel = currentState.stageModel.getPluginModel(pageKey, cartPlatformId);
          // Clearing cart on purchase complete
          dispatch(
            triggerAction({
              pluginConfig: dsConfig,
              pluginModel: dsModel,
              pluginSelector: [pluginId],
              eventModelJS: {
                value: 'clearCart',
              },
            }),
          );

          // Purchase analytics
          const transformedPurchaseEvent = transformPurchaseEvent(event);
          const orderId = _.get(transformedPurchaseEvent, 'orderId');
          dispatch(
            sendAnalyticsEvent(
              'track',
              'purchase',
              _.set(transformedPurchaseEvent, 'apptileEventId', `${orderId}:purchase`),
            ),
          );
          if (!isCustomerHasOrders) {
            dispatch(
              sendAnalyticsEvent(
                'track',
                'first_purchase',
                _.set(transformedPurchaseEvent, 'apptileEventId', `${orderId}:${_.kebabCase('first_purchase')}`),
              ),
            );
            dispatch(
              triggerAction({
                pluginConfig: cartPlatformDsConfig,
                pluginModel: cartPlatformDsModel,
                pluginSelector: [cartPlatformId],
                eventModelJS: {
                  value: 'updateCustomerHasOrders',
                },
              }),
            );
          }
        });

        shopifyCheckout.addEventListener('error', event => {
          logger.info('[Checkout] failure', event);
        });
      }

      const queryRunner = apolloQueryRunner();
      yield spawn(function* () {
        yield call(queryRunner.initClient, cartPlatformDsConfig.config.get('storefrontApiUrl'), (_, {headers}) => {
          return {
            headers: {
              ...headers,
              'X-Shopify-Storefront-Access-Token': cartPlatformDsConfig.config.get('storefrontAccessToken'),
            },
          };
        });
        yield call(initCartGenerator, dsConfig, cartPlatformDsConfig, queryRunner);
      });
    }
  },
  getQueries: function () {
    return apiRecords;
  },
  getQueryInputParams: function (queryName) {
    const queryDetails = apiRecords && apiRecords[queryName] ? apiRecords[queryName] : null;
    return queryDetails && queryDetails.editableInputParams ? queryDetails.editableInputParams : {};
  },
  resolveCredentialConfigs: function (_credentials) {
    return {};
  },
  resolveClearCredentialConfigs: function () {
    return [];
  },
  getPlatformIdentifier: function () {
    return 'cart';
  },
  runQuery: function* (
    _dsModel,
    _dsConfig,
    _dsModelValues,
    _queryName,
    _inputVariables,
    _options,
  ) {},
  options: {
    propertySettings,
    pluginListing,
  },
  editors: editors,
});

registerDatasource(shopifyCartDS.name, shopifyCartDS);

export default shopifyCartDS;
