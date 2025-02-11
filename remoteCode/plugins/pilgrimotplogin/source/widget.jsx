import {
  AjaxQueryRunner,
  baseDatasourceConfig,
  wrapDatasourceModel,
  registerDatasource,
} from 'apptile-core';

function makeInputVariablesTypeCompatible(inputVariables, editableInputParams) {
  if (!inputVariables) return inputVariables;

  return Object.entries(inputVariables).reduce((acc, [key, value]) => {
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
  }, {});
}

async function executeQuery(
  dsModel,
  dsConfig,
  dsModelValues,
  queryDetails,
  inputVariables,
  options,
) {
  try {
    if (!queryDetails) throw new Error('Invalid Query');
    let {endpointResolver, editableInputParams, endpoint} = queryDetails ?? {};

    endpoint = endpointResolver && endpointResolver(endpoint, inputVariables);
    const queryRunner = dsModelValues.get('queryRunner');

    const typedInputs = makeInputVariablesTypeCompatible(
      inputVariables,
      editableInputParams,
    );
    const typedInputVariables = queryDetails.inputResolver
      ? queryDetails.inputResolver(typedInputs)
      : typedInputs;

    const queryResponse = await queryRunner.runQuery(
      queryDetails.queryType,
      endpoint,
      typedInputVariables,
      {
        headers: {
          source: 'apptile-mobile-builder',
        },
      },
    );
    const rawData =
      queryResponse && queryResponse.data ? queryResponse.data : {};
    let transformedData = rawData;
    return {
      rawData,
      data: transformedData,
      hasNextPage: false,
      paginationMeta: null,
    };
  } catch (error) {
    console.error(error);
    return {
      rawData: {},
      data: {},
      hasNextPage: false,
      paginationMeta: {},
      errors: error?.response?.data?.message || error?.response?.data?.error,
      hasError: true,
    };
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8; // This ensures the UUID v4 format
    return v.toString(16);
  });
}

const pilgrimOTPLoginApiRecords = {
  sendOTP: {
    queryType: 'post',
    endpoint: '/polls/otp_sender/',

    endpointResolver: (endpoint, _inputParams, _paginationMeta) => {
      return endpoint;
    },
    editableInputParams: {
      mobileNumber: '',
    },
    inputResolver(inputVariables) {
      const {mobileNumber} = inputVariables;
      return {
        mobile_number: mobileNumber,
      };
    },
  },
  verifyOTP: {
    queryType: 'post',
    endpoint: '/polls/verify_otp/',

    endpointResolver: (endpoint, _inputParams, _paginationMeta) => {
      return endpoint;
    },
    editableInputParams: {
      mobileNumber: '',
      otp: '',
    },
    inputResolver(inputVariables) {
      const {mobileNumber, otp} = inputVariables;

      return {
        mobile_number: mobileNumber,
        otp: otp,
      };
    },
  },
  register: {
    queryType: 'post',
    endpoint: '/polls/register/',
    endpointResolver: (endpoint, _inputParams, _paginationMeta) => {
      return endpoint;
    },
    editableInputParams: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
    },
    inputResolver(inputVariables) {
      const {firstName, lastName, mobileNumber, password, email} =
        inputVariables;
      return {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobileNumber,
        password: generateUUID(),
        email: email,
        autopopup: 'no',
      };
    },
  },
};

const propertySettings = {};

export const PilgrimOTPLoginEditors = {
  basic: [
    {
      type: 'codeInput',
      name: 'apiBaseUrl',
      props: {
        label: 'API Url',
        placeholder: 'https://webengagebackup.discoverpilgrim.com',
      },
    },
  ],
};

const pluginListing = {
  labelPrefix: 'pilgrimOTPLogin',
  type: 'datasource',
  name: 'Pilgrim OTP Login',
  description: 'Pilgrim OTP Login',
  section: 'SDK',
  icon: 'datasource',
  manifest: {
    directoryName: 'pilgrimotplogin',
  },
};

const pilgrimOTPLoginDatasourceModel = wrapDatasourceModel({
  name: 'pilgrimOTPLogin',
  config: {
    ...baseDatasourceConfig,
    queryRunner: 'queryrunner',
    apiBaseUrl: '',
  },

  initDatasource: function* (dsModel, dsConfig, dsModelValues) {
    const queryRunner = AjaxQueryRunner();
    const requestUrl = dsConfig.config?.get('apiBaseUrl');

    queryRunner.initClient(requestUrl, config => {
      config.headers = {
        ...config.headers,
        ...{
          'Content-Type': 'application/json',
        },
      };
      return config;
    });

    return {
      modelUpdates: [
        {
          selector: [dsConfig.get('id'), 'queryRunner'],
          newValue: queryRunner,
        },
      ],
    };
  },

  getQueries: function () {
    return pilgrimOTPLoginApiRecords;
  },

  getQueryInputParams: function (queryName) {
    const queryDetails =
      pilgrimOTPLoginApiRecords && pilgrimOTPLoginApiRecords[queryName]
        ? pilgrimOTPLoginApiRecords[queryName]
        : null;
    return queryDetails && queryDetails?.editableInputParams
      ? queryDetails.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (credentials) {
    const {apiBaseUrl} = credentials;
    if (!apiBaseUrl) return false;
    return {
      apiBaseUrl: apiBaseUrl,
    };
  },
  resolveClearCredentialConfigs: function () {
    return ['apiBaseUrl'];
  },
  getPlatformIdentifier: function () {
    return 'pilgrimOTPLogin';
  },

  runQuery: function* (
    dsModel,
    dsConfig,
    dsModelValues,
    queryName,
    inputVariables,
    options,
  ) {
    const queryDetails = pilgrimOTPLoginApiRecords[queryName];
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
  editors: PilgrimOTPLoginEditors,
});

registerDatasource(
  pilgrimOTPLoginDatasourceModel.name,
  pilgrimOTPLoginDatasourceModel,
);

export default pilgrimOTPLoginDatasourceModel;
