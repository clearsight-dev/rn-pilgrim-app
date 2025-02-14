import {registerDatasource} from 'apptile-core';
import {baseDatasourceConfig, wrapDatasourceModel} from 'apptile-core';
import freeGiftsActions from '../actions/freeGiftsActions';

const pluginListing = {
  labelPrefix: 'freeGifts',
  type: 'datasource',
  name: 'Free gifts datasource',
  description: 'apptile free gifts',
  section: 'SDK',
  icon: 'datasource',
  manifest: {
    directoryName: 'FreeGifts',
  },
};

const propertySettings = {
  attachFreebieToCartLineItems: {
    getValue(_model, _renderedValue, _selector) {
      return freeGiftsActions.attachFreebieToCartLineItems;
    },
  },
};

export const freeGiftsApiRecords = {
  GetCampaignConfig: {
    queryType: 'get',
    endpoint: '/app',
    endpointResolver: (endpoint, inputVariables) =>
      `${endpoint}/${inputVariables.storeId}.json`,
    editableInputParams: {
      storeId: '',
    },
  },
};

export const freeGiftsEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'config',
      props: {
        label: 'config',
        placeHolder: '',
      },
    },
  ],
};

const freegiftsDsModel = wrapDatasourceModel({
  name: 'freeGifts',
  config: {
    ...baseDatasourceConfig,
    config: '',
    attachFreebieToCartLineItems: 'function',
    attachFreebieToCartLineItemsV2: 'function',
  },

  initDatasource: function* (_dsModel, _dsConfig, _dsModelValues) {},

  onPluginUpdate: function* (
    _state,
    _pluginId,
    _pageKey,
    _instance,
    _userTriggered,
    _pageLoad,
    _options,
  ) {},

  getQueries: function () {
    return freeGiftsApiRecords;
  },

  getQueryInputParams: function (queryName) {
    const queryDetails =
      freeGiftsApiRecords && freeGiftsApiRecords[queryName]
        ? freeGiftsApiRecords[queryName]
        : null;
    return queryDetails && queryDetails.editableInputParams
      ? queryDetails.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (_credentials) {
    return {};
  },

  resolveClearCredentialConfigs: function () {
    return [];
  },
  getPlatformIdentifier: function () {
    return 'freeGifts';
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
  editors: freeGiftsEditors,
});

registerDatasource(freegiftsDsModel.name, freegiftsDsModel);

export default freegiftsDsModel;
