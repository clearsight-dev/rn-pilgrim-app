import {
  PluginConfigType,
  RootState,
  registerDatasource,
  wrapDatasourceModel,
  AppPageTriggerOptions,
  PluginListingSettings,
  PluginPropertySettings,
  DatasourceQueryDetail,
  baseDatasourceConfig,
  DatasourcePluginConfig,
} from 'apptile-core';

import freeGiftsActions from '../actions/freeGiftsActions';

interface IFreeGiftsCredentials {}

const propertySettings: PluginPropertySettings = {
  attachFreebieToCartLineItems: {
    getValue(_model, _renderedValue, _selector) {
      return freeGiftsActions.attachFreebieToCartLineItems;
    },
  },
};

const pluginListing: Partial<PluginListingSettings> = {
  labelPrefix: 'freeGifts',
  type: 'datasource',
  name: 'Free gifts',
  description: 'apptile free gifts',
  section: 'SDK',
  manifest: {
    directoryName: 'FreeGifts',
  },
  icon: 'datasource',
};

export type FreeGiftsPluginConfigType = DatasourcePluginConfig &
  IFreeGiftsCredentials & {
    attachFreebieToCartLineItems: string;
    attachFreebieToCartLineItemsV2: string;
  };

export const freeGiftsApiRecords: Record<string, any> = {
  GetCampaignConfig: {
    queryType: 'get',
    endpoint: '/app',
    endpointResolver: (endpoint: string, inputVariables: any) =>
      `${endpoint}/${inputVariables.storeId}.json`,
    editableInputParams: {
      storeId: '',
    },
  },
};

export const freeGiftsEditors: any = {
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

const DSModel = wrapDatasourceModel({
  name: 'freeGifts',
  config: {
    ...baseDatasourceConfig,
    config: '',
    attachFreebieToCartLineItems: 'function',
    attachFreebieToCartLineItemsV2: 'function',
  } as FreeGiftsPluginConfigType,

  initDatasource: function* (
    _dsModel: any,
    _dsConfig: PluginConfigType<FreeGiftsPluginConfigType>,
    _dsModelValues: any,
  ) {},

  onPluginUpdate: function* (
    _state: RootState,
    _pluginId: string,
    _pageKey: string,
    _instance: number | null,
    _userTriggered: boolean,
    _pageLoad: boolean,
    _options: AppPageTriggerOptions,
  ) {},

  getQueries: function (): Record<string, DatasourceQueryDetail> {
    return freeGiftsApiRecords;
  },

  getQueryInputParams: function (queryName: string) {
    const queryDetails =
      freeGiftsApiRecords && freeGiftsApiRecords[queryName]
        ? freeGiftsApiRecords[queryName]
        : null;
    return queryDetails && queryDetails.editableInputParams
      ? queryDetails.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (_credentials: IFreeGiftsCredentials) {
    return {};
  },

  resolveClearCredentialConfigs: function (): string[] {
    return [];
  },
  // getPlatformIdentifier: function (): IntegrationPlatformType {
  getPlatformIdentifier: function () {
    return 'freeGifts';
  },

  runQuery: function* (
    _dsModel: any,
    _dsConfig: any,
    _dsModelValues: any,
    _queryName: string,
    _inputVariables: any,
    _options?: AppPageTriggerOptions,
  ) {},

  options: {
    propertySettings,
    pluginListing,
  },
  editors: freeGiftsEditors,
});

registerDatasource(DSModel.name, DSModel);

export default DSModel;
