import {
  wrapDatasourceModel,
  registerDatasource,
  AjaxQueryRunner,
  TriggerActionIdentifier
} from 'apptile-core';
import {datasourceModel, queryDetails as shoplazzaQueryDetails} from './ds';
import shoplazzaActions from './actions';

const pluginListing = {
  labelPrefix: 'shoplazzads',
  type: 'datasource',
  name: 'shoplazzads',
  description: 'Shoplazza datasource',
  section: 'SDK',
  icon: 'datasource',
  manifest: {
    directoryName: 'shoplazzads',
  },
};
const propertySettings = {
  openLink: {
    type: TriggerActionIdentifier,
    getValue(_model, _renderedValue, _selector) {
      return shoplazzaActions.openLink;
    },
    actionMetadata: {
      editableInputParams: {
        url: '',
      },
    },
  },
};

datasourceModel.name = pluginListing.name;
datasourceModel.options.pluginListing = pluginListing;
datasourceModel.options.propertySettings = propertySettings;

const makeInputParamsResolver = contextInputParams => {
  return (dsConfig, dsModelValues) => {
    const dsPluginConfig = dsConfig.get('config');
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

const executeQuery = async (
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
    if (queryDetails.queryHeadersResolver) {
      headers = queryDetails.queryHeadersResolver(
        inputVariables,
        contextInputVariables,
      );
    }

    let queryRunner = AjaxQueryRunner();

    const queryResponse = {data: {}};
    queryResponse.data = await fetch(apiBaseUrl + endpoint).then(res =>
      res.json(),
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

datasourceModel.getQueries = () => shoplazzaQueryDetails;
datasourceModel.getPlatformIdentifier = 'shoplazza';
datasourceModel.getQueryInputParams = function (queryName) {
  const queryDetails =
    shoplazzaQueryDetails && shoplazzaQueryDetails[queryName]
      ? shoplazzaQueryDetails[queryName]
      : null;
  return queryDetails?.editableInputParams
    ? queryDetails?.editableInputParams
    : {};
};
datasourceModel.runQuery = function* (
  dsModel,
  dsConfig,
  dsModelValues,
  queryName,
  inputVariables,
  options,
) {
  if (!shoplazzaQueryDetails[queryName]) {
    return;
  }
  return yield executeQuery(
    dsModel,
    dsConfig,
    dsModelValues,
    shoplazzaQueryDetails[queryName],
    inputVariables,
    options,
  );
};
console.log('datasourceModel.options', datasourceModel.options);

const shoplazzaDatasourceModel = wrapDatasourceModel(datasourceModel);
registerDatasource(shoplazzaDatasourceModel.name, shoplazzaDatasourceModel);
export default shoplazzaDatasourceModel;
