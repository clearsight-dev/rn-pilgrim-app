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

const propertySettings: PluginPropertySettings = {};

const pluginListing: Partial<PluginListingSettings> = {
  labelPrefix: 'cartUpsellDatasource',
  type: 'datasource',
  name: 'Cart Upsell Datasource',
  description: 'cart upsell datasource',
  section: 'SDK',
  manifest: {
    directoryName: 'CartUpsellDS',
  },
  icon: 'datasource',
};

export type CartUpsellPluginConfigType = DatasourcePluginConfig;

export const cartUpsellApiRecords: Record<string, any> = {};

export const CartUpsellEditors: any = {
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
  name: 'CartUpsell',
  config: {
    ...baseDatasourceConfig,
    config: '',
  } as CartUpsellPluginConfigType,

  initDatasource: function* (
    _dsModel: any,
    _dsConfig: PluginConfigType<CartUpsellPluginConfigType>,
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
    return cartUpsellApiRecords;
  },

  getQueryInputParams: function (queryName: string) {
    const queryDetails =
      cartUpsellApiRecords && cartUpsellApiRecords[queryName]
        ? cartUpsellApiRecords[queryName]
        : null;
    return queryDetails && queryDetails.editableInputParams
      ? queryDetails.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (_credentials: any) {
    return {};
  },

  resolveClearCredentialConfigs: function (): string[] {
    return [];
  },
  // getPlatformIdentifier: function (): IntegrationPlatformType {
  getPlatformIdentifier: function () {
    return 'CartUpsell';
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
  editors: CartUpsellEditors,
});

registerDatasource(DSModel.name, DSModel);

export default DSModel;
