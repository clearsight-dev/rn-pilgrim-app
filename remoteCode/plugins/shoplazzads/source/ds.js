export const queryDetails = {
  GetProductFromCollectionId: {
    isPaginated: false,
    contextInputParams: {
      apiBaseUrl: '',
    },
    transformer: data => {
      return data.data.products.map(product => {
        console.log(product, 'https:' + product?.image?.src);
        return {
          ...product,
          featuredImage: product?.image?.src
            ? `https:${product?.image?.src}`
            : '',
        };
      });
    },
    paginationResolver: null,
    inputResolver: null,
    apiBaseUrlResolver: dsModel => {
      return dsModel.get('apiBaseUrl');
    },
    serverApiBaseUrlResolver: dsModel => {
      return dsModel.get('serverApiBaseUrl');
    },

    queryType: 'get',
    endpoint: '/api/collections/',
    editableInputParams: {
      collectionId: '',
    },
    endpointResolver: (endpoint, inputParams) => {
      const {collectionId} = inputParams;
      const resolvedEndpoint = `${endpoint}${collectionId}/cps?page=0&limit=8`;
      return resolvedEndpoint;
    },
    queryHeadersResolver: () => {
      return {
        'Content-Type': 'application/json',
      };
    },
  },
};

export const datasourceModel = {
  config: {
    apiBaseUrl: 'https://app.shoplazza.com/api-front-v1',
    serverApiBaseUrl: 'https://dev-api.apptile.io/shoplazza-proxy',
    queryRunner: 'queryrunner',
  },
  resolveCredentialConfigs: function (credentials) {
    const {apiBaseUrl} = credentials;
    if (!apiBaseUrl) {
      return false;
    }
    return {
      apiBaseUrl: apiBaseUrl,
    };
  },
  resolveClearCredentialConfigs: function () {
    return ['apiBaseUrl'];
  },

  editors: {
    basic: [
      {
        type: 'codeInput',
        name: 'apiBaseUrl',
        props: {
          label: 'API Base url',
          placeholder: 'https://api.shoplazza.in/api/v2',
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
    ],
  },

  onPluginUpdate: null,

  options: {
    propertySettings: {},
  },
};
