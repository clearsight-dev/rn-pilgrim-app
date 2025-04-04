import {
  PluginEditorsConfig,
  PluginConfigType,
  AppPageTriggerOptions,
  PluginListingSettings,
  PluginModelType,
  PluginPropertySettings,
  DatasourceQueryDetail,
  DatasourceQueryReturnValue,
  DatasourcePluginConfig,
  IntegrationPlatformType,
  registerDatasource,
  wrapDatasourceModel,
  AjaxQueryRunner,
  jsonToQueryString,
} from 'apptile-core';

interface IClickpostCredentials {
  apiBaseUrl: string;
  storeApiAuthenticationKey: string;
  serverApiAuthenticationKey: string;
}

export interface ClickpostPluginConfigType extends DatasourcePluginConfig {
  apiBaseUrl: string;
  serverApiBaseUrl: string;
  appId: string;
  // customerAccessToken: string;
  queryRunner: any;
  headers: Record<string, any>;
}

type IEditableParams = Record<string, any>;

type ClickpostQueryDetails = DatasourceQueryDetail & {
  queryType: 'get' | 'post' | 'put' | 'patch' | 'delete';
  endpoint: string;
  transformer?: TransformerFunction;
  contextInputParams?: {[key: string]: any};
  queryHeadersResolver?: (
    inputVariables: any,
    contextInputVariables: any,
  ) => any;
  inputResolver?: (inputVariables: any) => any;
  paginationResolver?: (
    inputVariables: Record<string, any>,
    paginationMeta: any,
  ) => Record<string, any>;
  endpointResolver: (
    endpoint: string,
    inputVariables: any,
    contextInputVariables: any,
  ) => string;
  apiBaseUrlResolver: (dsModel: any) => string;
  editableInputParams: IEditableParams;
};
export type TransformerFunction = (data: any) => {
  data: any;
  hasNextPage?: boolean;
  paginationMeta?: any;
};

const baseClickpostQuerySpec: Partial<ClickpostQueryDetails> = {
  isPaginated: false,
  contextInputParams: {
    apiBaseUrl: '',
  },
  endpointResolver: (endpoint, inputParams, getNextPage) => {
    return endpoint;
  },
  apiBaseUrlResolver: (dsModel: any) => {
    return dsModel.get('apiBaseUrl');
  },
  transformer: data => {
    return {data, hasNextPage: false, paginationMeta: {}};
  },
  paginationResolver: (
    inputVariables: Record<string, any>,
    paginationMeta: any,
  ): Record<string, any> => {
    const {after} = paginationMeta ?? {};
    return after ? {...inputVariables, after} : inputVariables;
  },
  inputResolver: (inputVariables: any) => {
    return inputVariables;
  },
  queryHeadersResolver: (inputVariables: any, contextInputVariables: any) => {
    return {};
  },
};

export const ClickpostApiRecords: Record<
  string,
  Partial<ClickpostQueryDetails>
> = {
  TrackOrder: {
    ...baseClickpostQuerySpec,
    queryType: 'get',
    endpoint: '/api/v2/track-order/',
    apiBaseUrlResolver: (dsModel: any) => {
      return dsModel.get('serverApiBaseUrl');
    },
    editableInputParams: {
      username: '',
      waybill: '',
      cp_id: '',
    },
    endpointResolver: (endpoint, inputParams) => {
      const {username, waybill, cp_id} = inputParams;
      const queryParams = {username, waybill, cp_id};
      const resolvedEndpoint = `${endpoint}${jsonToQueryString(queryParams)}`;
      return resolvedEndpoint;
    },
    queryHeadersResolver: () => {
      return {
        'Content-Type': 'application/json',
      };
    },
  },
};

const propertySettings: PluginPropertySettings = {};
const pluginListing: Partial<PluginListingSettings> = {
  labelPrefix: 'Clickpost',
  type: 'datasource',
  name: 'Clickpost Integration',
  description: 'Clickpost Integration.',
  defaultHeight: 0,
  defaultWidth: 0,
  icon: 'datasource',
  section: 'SDK',
  manifest: {
    directoryName: 'clickpost',
  },
};

export const ClickpostEditors: PluginEditorsConfig<any> = {
  basic: [
    {
      type: 'codeInput',
      name: 'apiBaseUrl',
      props: {
        label: 'API Base url',
        placeholder: 'https://api.clickpost.in/api/v2',
      },
    },
    {
      type: 'codeInput',
      name: 'serverApiBaseUrl',
      props: {
        label: 'Server API Base url',
        placeholder: '',
      },
    },
    // {
    //   type: 'codeInput',
    //   name: 'appId',
    //   props: {
    //     label: 'app Id',
    //     placeholder: '',
    //   },
    // },
    // {
    //   type: 'codeInput',
    //   name: '',
    //   props: {
    //     label: 'Store Api Authentication Key',
    //     placeholder: '',
    //   },
    // },
  ],
};

const makeInputParamsResolver = (
  contextInputParams: {[key: string]: string} | undefined,
) => {
  return (
    dsConfig: PluginConfigType<ClickpostPluginConfigType>,
    dsModelValues: PluginModelType,
  ) => {
    const dsPluginConfig = dsConfig.get('config') as any as Immutable.Map<
      string,
      ClickpostPluginConfigType
    >;
    if (!dsPluginConfig) {
      return;
    }

    return Object.entries(contextInputParams).reduce((acc, [key, value]) => {
      if (dsPluginConfig && dsPluginConfig.get(key)) {
        return {...acc, [key]: dsPluginConfig.get(key)};
      }
      if (dsModelValues && dsModelValues.get(key)) {
        return {...acc, [key]: dsModelValues.get(key)};
      }
      return acc;
    }, {});
  };
};

const makeInputVariablesTypeCompatible = (
  inputVariables: {[key: string]: any},
  editableInputParams: {[key: string]: any},
) => {
  return Object.entries(inputVariables).reduce((acc, [key, value]) => {
    if (editableInputParams && editableInputParams[key] !== undefined) {
      if (typeof editableInputParams[key] === 'number') {
        return {
          ...acc,
          [key]:
            isNaN(value) && typeof value === typeof editableInputParams[key]
              ? value
              : parseInt(value),
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

export const executeQuery = async (
  dsModel: any,
  dsConfig: any,
  dsModelValues: any,
  queryDetails: ClickpostQueryDetails,
  inputVariables: any,
  options?: AppPageTriggerOptions,
) => {
  try {
    let {endpointResolver, contextInputParams, editableInputParams, endpoint} =
      queryDetails ?? {};
    const contextInputParamsResolver =
      makeInputParamsResolver(contextInputParams);
    const contextInputVariables = contextInputParamsResolver(
      dsConfig,
      dsModelValues,
    );

    let typedInputVariables, typedDataVariables;
    if (editableInputParams) {
      typedInputVariables = makeInputVariablesTypeCompatible(
        inputVariables,
        editableInputParams,
      );
    }

    endpoint =
      endpointResolver &&
      endpointResolver(endpoint, typedInputVariables, contextInputVariables);

    typedDataVariables = queryDetails.inputResolver
      ? queryDetails.inputResolver(typedInputVariables)
      : typedInputVariables;

    const apiBaseUrl = queryDetails.apiBaseUrlResolver(dsModelValues);

    let headers = {};
    if (queryDetails.queryHeadersResolver) {
      headers = queryDetails.queryHeadersResolver(
        inputVariables,
        contextInputVariables,
      );
    }

    let queryRunner = AjaxQueryRunner();

    queryRunner.initClient(apiBaseUrl, config => {
      config.headers = {
        ...config.headers,
        ...{
          ...headers,
          'Content-Type': 'application/json',
        },
      };
      return config;
    });

    // const queryRunner = dsModelValues.get('queryRunner');
    const queryResponse = await queryRunner.runQuery(
      queryDetails.queryType,
      endpoint,
      {...typedDataVariables},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const rawData =
      queryResponse && queryResponse.data ? queryResponse.data : {};
    let transformedData = rawData;
    let queryHasNextPage, paginationDetails;
    if (queryDetails && queryDetails.transformer) {
      const {
        data,
        hasNextPage,
        paginationMeta: pageData,
      } = queryDetails.transformer(rawData, null, dsModelValues);

      transformedData = data;
      queryHasNextPage = hasNextPage;
      paginationDetails = pageData;
    }

    return {
      rawData,
      data: transformedData,
      hasNextPage: queryHasNextPage,
      paginationMeta: paginationDetails,
      errors: [],
      hasError: false,
    };
  } catch (ex: any) {
    const errors = ex?.response?.data?.errors || [ex?.message];
    return {
      rawData: {},
      data: {},
      hasNextPage: false,
      paginationMeta: {},
      errors: errors,
      hasError: true,
    };
  }
};

const clickpostDatasourceModel = wrapDatasourceModel({
  name: 'Clickpost',
  config: {
    apiBaseUrl: 'https://app.clickpost.com/api-front-v1',
    serverApiBaseUrl: 'https://dev-api.apptile.io/clickpost-proxy',
    queryRunner: 'queryrunner',
  } as ClickpostPluginConfigType,

  // initDatasource: function* (dsModel: any, dsConfig: PluginConfigType<ClickpostPluginConfigType>, dsModelValues: any) {
  //   const queryRunner = AjaxQueryRunner();
  //   queryRunner.initClient(dsConfig.config.get('apiBaseUrl'), config => {
  //     const  = dsModelValues?.get('') ?? {};
  //     config.headers = {...config.headers, ...{'x-api-key': }};
  //     return config;
  //   });
  //   return {
  //     modelUpdates: [
  //       {
  //         selector: [dsConfig.get('id'), 'queryRunner'],
  //         newValue: queryRunner,
  //       },
  //     ],
  //   };
  // },
  getQueries: function (): Record<string, DatasourceQueryDetail> {
    return ClickpostApiRecords;
  },

  getQueryInputParams: function (queryName: string) {
    const queryDetails =
      ClickpostApiRecords && ClickpostApiRecords[queryName]
        ? ClickpostApiRecords[queryName]
        : null;
    return queryDetails?.editableInputParams
      ? queryDetails?.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (
    credentials: IClickpostCredentials,
  ): Partial<ClickpostPluginConfigType> | boolean {
    const {apiBaseUrl} = credentials;
    if (!apiBaseUrl) {
      return false;
    }
    return {
      apiBaseUrl: apiBaseUrl,
    };
  },
  onPluginUpdate: function* (
    state: RootState,
    pluginId: string,
    pageKey: string,
    instance: number | null,
    userTriggered: boolean,
    pageLoad: boolean,
    options: AppPageTriggerOptions,
  ) {},

  resolveClearCredentialConfigs: function (): string[] {
    return ['apiBaseUrl'];
  },
  getPlatformIdentifier: function (): IntegrationPlatformType {
    return 'clickpost';
  },

  runQuery: function* (
    dsModel,
    dsConfig,
    dsModelValues,
    queryName: string,
    inputVariables: any,
    options?: AppPageTriggerOptions,
  ): DatasourceQueryReturnValue {
    const queryDetails = ClickpostApiRecords[queryName];
    if (!queryDetails) {
      return;
    }
    return yield executeQuery(
      dsModel,
      dsConfig,
      dsModelValues,
      queryDetails,
      inputVariables,
      options,
    );
  },
  options: {
    propertySettings,
    pluginListing,
  },
  editors: ClickpostEditors,
});

registerDatasource(clickpostDatasourceModel.name, clickpostDatasourceModel);
export default clickpostDatasourceModel;
