import _ from 'lodash';
import {call, put, spawn, select, delay} from 'redux-saga/effects';
import {modelUpdateAction, LocalStorage, triggerAction} from 'apptile-core';

import {CART_KEY_FOR_LOCAL_STORAGE_KEY, CART_OBJECT_KEY} from '../constants';
import {GET_METAOBJECT, GET_METAOBJECTS_BY_HANDLE} from '../metaobjects';

// ![One ds should not import another ds file here importing for temporary solution for pilgrim's use case]
import {ConfigSchema} from '../../FreeGifts/validators';
import {transformMetaObjectToFreeGiftConfig} from '../../FreeGifts/transformers';
import {TransformCartUpsellConfig} from '../../CartUpsellDS/transformers';

export function* initCartGenerator(
  pluginDsConfig,
  _cartPlatformDsConfig,
  queryRunner,
) {
  // Initialize cart from local storage
  const cartLSKey = pluginDsConfig.config.get(CART_KEY_FOR_LOCAL_STORAGE_KEY);
  let currentCart = yield call(LocalStorage.getValue, cartLSKey);

  // Initialize free gift configuration
  const freeGiftConfig = yield call(
    initializeFreeGiftConfig,
    pluginDsConfig,
    queryRunner,
  );

  // Initialize cart upsell configuration
  const cartUpsellConfig = yield call(
    initializeCartUpsellConfig,
    pluginDsConfig,
    queryRunner,
  );

  // Refreshing cartLine Cache
  yield spawn(function* () {
    yield delay(3000);
    const currentState = yield select();
    var currentModel = currentState.stageModel.getModelValue([]);
    const dsModel = currentModel.get(pluginDsConfig.get('id'));

    yield put(
      triggerAction({
        pluginConfig: pluginDsConfig,
        pluginModel: dsModel,
        pluginSelector: [pluginDsConfig.get('id')],
        eventModelJS: {
          value: 'refreshCartLineCache',
        },
      }),
    );
  });

  // Update the model with the current cart and free gift configuration
  yield put(
    modelUpdateAction([
      {
        selector: [pluginDsConfig.get('id'), CART_OBJECT_KEY],
        newValue: currentCart,
      },
      {
        selector: [
          pluginDsConfig.getIn(['config', 'freeGiftDatasourceId']),
          'config',
        ],
        newValue: freeGiftConfig,
      },
      {
        selector: ['cartUpsellDatasource', 'config'],
        newValue: cartUpsellConfig,
      },
    ]),
  );
}

function* initializeFreeGiftConfig(pluginDsConfig, queryRunner) {
  const freeGiftDataSourceId = pluginDsConfig.getIn([
    'config',
    'freeGiftDatasourceId',
  ]);
  const freeGiftMetaObjectId = pluginDsConfig.getIn([
    'config',
    'freeGiftMetaobjectId',
  ]);

  if (_.isEmpty(freeGiftDataSourceId) || _.isEmpty(freeGiftMetaObjectId)) {
    return {isEnabled: false};
  }

  try {
    const queryResponse = yield call(
      queryRunner.runQuery,
      'query',
      GET_METAOBJECT,
      {id: freeGiftMetaObjectId},
      {},
    );
    const freeGiftMetaObject = queryResponse?.data?.metaobject;

    if (_.isEmpty(freeGiftMetaObject)) {
      return {isEnabled: false};
    }

    const transformedFreeGiftConfig =
      transformMetaObjectToFreeGiftConfig(freeGiftMetaObject);
    const schemaValidation = ConfigSchema.validate(transformedFreeGiftConfig);

    return transformedFreeGiftConfig.isEnabled &&
      _.isEmpty(schemaValidation.error)
      ? transformedFreeGiftConfig
      : {isEnabled: false};
  } catch (err) {
    console.error('Free Gift Config Initialization failed', err);
    return {isEnabled: false};
  }
}

function* initializeCartUpsellConfig(pluginDsConfig, queryRunner) {
  const cartUpsellMetaObjectHandle = pluginDsConfig.getIn([
    'config',
    'cartUpsellMetaObjectHandle',
  ]);

  if (_.isEmpty(cartUpsellMetaObjectHandle)) {
    return {isEnabled: false};
  }

  try {
    const queryResponse = yield call(
      queryRunner.runQuery,
      'query',
      GET_METAOBJECTS_BY_HANDLE,
      {handle: cartUpsellMetaObjectHandle},
      {},
    );
    const configMetaObjects = queryResponse?.data?.metaobjects?.edges || [];
    if (!configMetaObjects.length) {
      return {isEnabled: false};
    }

    const transformedCartUpsellConfig =
      TransformCartUpsellConfig(configMetaObjects);
    return transformedCartUpsellConfig;
  } catch (err) {
    console.error('Cart Upsell Config Initialization failed', err);
    return {isEnabled: false};
  }
}
