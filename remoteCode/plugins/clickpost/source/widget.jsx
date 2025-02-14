import {registerDatasource} from 'apptile-core';
import {AjaxQueryRunner} from 'apptile-core';
import {jsonToQueryString} from 'apptile-core';
import {wrapDatasourceModel} from 'apptile-core';

const pluginListing = {
  labelPrefix: 'Clickpost',
  type: 'datasource',
  name: 'Clickpost datasource',
  description: 'Clickpost datasource',
  section: 'SDK',
  icon: 'datasource',
  manifest: {
    directoryName: 'clickpost',
  },
};

// ------------------------------------------------

const baseClickpostQuerySpec = {
  isPaginated: false,
  contextInputParams: {
    apiBaseUrl: '',
  },
  endpointResolver: (endpoint, inputParams, getNextPage) => {
    return endpoint;
  },
  apiBaseUrlResolver: dsModel => {
    return dsModel.get('apiBaseUrl');
  },
  transformer: data => {
    return {data, hasNextPage: false, paginationMeta: {}};
  },
  paginationResolver: (inputVariables, paginationMeta) => {
    const {after} = paginationMeta ?? {};
    return after ? {...inputVariables, after} : inputVariables;
  },
  inputResolver: inputVariables => {
    return inputVariables;
  },
  queryHeadersResolver: (inputVariables, contextInputVariables) => {
    return {};
  },
};

export const ClickpostApiRecords = {
  TrackOrder: {
    ...baseClickpostQuerySpec,
    queryType: 'get',
    endpoint: '/api/v2/track-order/',
    apiBaseUrlResolver: dsModel => {
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

const propertySettings = {};

export const ClickpostEditors = {
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

const makeInputParamsResolver = contextInputParams => {
  return (dsConfig, dsModelValues) => {
    const dsPluginConfig = dsConfig.get('config');
    if (!dsPluginConfig) return;

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
  inputVariables,
  editableInputParams,
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
  dsModel,
  dsConfig,
  dsModelValues,
  queryDetails,
  inputVariables,
  options,
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
    if (queryDetails.queryHeadersResolver)
      headers = queryDetails.queryHeadersResolver(
        inputVariables,
        contextInputVariables,
      );

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
  } catch (ex) {
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
  },

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
  getQueries: function () {
    return ClickpostApiRecords;
  },

  getQueryInputParams: function (queryName) {
    const queryDetails =
      ClickpostApiRecords && ClickpostApiRecords[queryName]
        ? ClickpostApiRecords[queryName]
        : null;
    return queryDetails?.editableInputParams
      ? queryDetails?.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (credentials) {
    const {apiBaseUrl} = credentials;
    if (!apiBaseUrl) return false;
    return {
      apiBaseUrl: apiBaseUrl,
    };
  },
  onPluginUpdate: function* (
    state,
    pluginId,
    pageKey,
    instance,
    userTriggered,
    pageLoad,
    options,
  ) {},

  resolveClearCredentialConfigs: function () {
    return ['apiBaseUrl'];
  },
  getPlatformIdentifier: function () {
    return 'clickpost';
  },

  runQuery: function* (
    dsModel,
    dsConfig,
    dsModelValues,
    queryName,
    inputVariables,
    options,
  ) {
    const queryDetails = ClickpostApiRecords[queryName];
    if (!queryDetails) return;
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
