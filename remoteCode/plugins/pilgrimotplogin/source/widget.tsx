import {PluginConfigType, registerDatasource} from 'apptile-core';
import {
  AppPageTriggerOptions,
  PluginListingSettings,
  PluginPropertySettings,
  AjaxQueryRunner,
  DatasourceQueryDetail,
  wrapDatasourceModel,
  DatasourceQueryReturnValue,
} from 'apptile-core';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8; // This ensures the UUID v4 format
    return v.toString(16);
  });
}

interface IBaseCredentials {
  appId: string;
  proxyUrl?: string;
  platformType: string;
}

interface IPilgrimOTPLoginCredentials extends IBaseCredentials {
  apiBaseUrl: string;
}

export type PilgrimOTPLoginConfigType = {
  secretsConfigured: boolean;
  queryRunner: any;
  apiBaseUrl: string;
};

type PilgrimOTPLoginQueryDetails = DatasourceQueryDetail & {
  queryType: 'get' | 'post' | 'put' | 'patch' | 'delete';
  endpoint: string;
  contextInputParams?: {[key: string]: any};
  endpointResolver?: (
    endpoint: string,
    inputVariables: any,
    paginationMeta: any,
  ) => string;
  inputResolver?: (inputVariables: any) => any;
  transformer?: (data: any, paginationMeta: any) => any;
  paginationResolver?: (inputVariables: any, paginationMeta: any) => any;
  headersResolver?: (inputVariables: any) => any;
};

const makeInputVariablesTypeCompatible = (
  inputVariables: {[key: string]: any},
  editableInputParams: {[key: string]: any} | undefined,
) => {
  if (!inputVariables) {
    return inputVariables;
  }

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
};

const pilgrimOTPLoginApiRecords: Record<string, PilgrimOTPLoginQueryDetails> = {
  sendOTP: {
    queryType: 'post',
    endpoint: '/polls/otp_sender/',

    endpointResolver: (
      endpoint: string,
      _inputParams: any,
      _paginationMeta: any,
    ) => {
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

    endpointResolver: (
      endpoint: string,
      _inputParams: any,
      _paginationMeta: any,
    ) => {
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
    endpointResolver: (
      endpoint: string,
      _inputParams: any,
      _paginationMeta: any,
    ) => {
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
  orderCancel: {
    queryType: 'post',
    endpoint: '/polls/order_cancel',
    endpointResolver: (
      endpoint: string,
      _inputParams: any,
      _paginationMeta: any,
    ) => {
      return endpoint;
    },
    editableInputParams: {
      orderNumber: '',
      orderId: '',
      customerId: '',
      cancelReason: '',
      otherCancelReason: '',
      token: '',
    },
    inputResolver(inputVariables) {
      const {
        orderNumber,
        orderId,
        customerId,
        cancelReason,
        otherCancelReason,
        token,
      } = inputVariables;
      return {
        order_number: orderNumber,
        order_id: orderId,
        token: token,
        customer_id: customerId,
        cancel_reason: cancelReason,
        other_cancel_reason: otherCancelReason,
      };
    },
  },
};

const propertySettings: PluginPropertySettings = {};

const pluginListing: Partial<PluginListingSettings> = {
  labelPrefix: 'pilgrimOTPLogin',
  type: 'datasource',
  name: 'Pilgrim OTP Login',
  description: 'Pilgrim OTP Login',
  defaultHeight: 0,
  defaultWidth: 0,
  section: 'SDK',
  icon: 'datasource',
  manifest: {
    directoryName: 'pilgrimotplogin',
  },
};

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

export const executeQuery = async (
  dsModel: any,
  dsConfig: any,
  dsModelValues: any,
  queryDetails: any,
  inputVariables: any,
  options?: AppPageTriggerOptions,
) => {
  try {
    if (!queryDetails) {
      throw new Error('Invalid Query');
    }
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
};

const pilgrimOTPLoginDatasourceModel = wrapDatasourceModel({
  name: 'pilgrimOTPLogin',
  config: {
    secretsConfigured: false,
    queryRunner: 'queryrunner',
    apiBaseUrl: '',
  } as PilgrimOTPLoginConfigType,

  initDatasource: function* (
    dsModel: any,
    dsConfig: PluginConfigType<PilgrimOTPLoginConfigType>,
    dsModelValues: any,
  ) {
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

  getQueries: function (): Record<string, DatasourceQueryDetail> {
    return pilgrimOTPLoginApiRecords;
  },

  getQueryInputParams: function (queryName: string) {
    const queryDetails =
      pilgrimOTPLoginApiRecords && pilgrimOTPLoginApiRecords[queryName]
        ? pilgrimOTPLoginApiRecords[queryName]
        : null;
    return queryDetails && queryDetails?.editableInputParams
      ? queryDetails.editableInputParams
      : {};
  },

  resolveCredentialConfigs: function (
    credentials: IPilgrimOTPLoginCredentials,
  ): Partial<PilgrimOTPLoginConfigType> | boolean {
    const {apiBaseUrl} = credentials;
    if (!apiBaseUrl) {
      return false;
    }
    return {
      apiBaseUrl: apiBaseUrl,
    };
  },
  resolveClearCredentialConfigs: function (): string[] {
    return ['apiBaseUrl'];
  },
  // getPlatformIdentifier: function (): IntegrationPlatformType {
  getPlatformIdentifier: function () {
    return 'pilgrimOTPLogin';
  },

  runQuery: function* (
    dsModel,
    dsConfig,
    dsModelValues,
    queryName: string,
    inputVariables: any,
    options?: AppPageTriggerOptions,
  ): DatasourceQueryReturnValue {
    const queryDetails = pilgrimOTPLoginApiRecords[queryName];
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
  editors: PilgrimOTPLoginEditors,
});

registerDatasource(
  pilgrimOTPLoginDatasourceModel.name,
  pilgrimOTPLoginDatasourceModel,
);

export default pilgrimOTPLoginDatasourceModel;
