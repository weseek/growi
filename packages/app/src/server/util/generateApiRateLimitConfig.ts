import { IApiRateLimitConfig } from '../interfaces/api-rate-limit-config';

const sortApiRateEndpointKeys = (endpoints: string[]): string[] => {
  return endpoints.sort((a, b) => {
    const targetA = a.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
    const priorityA = Number(targetA.split('_')[0]);

    const targetB = b.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
    const priorityB = Number(targetB.split('_')[0]);

    if (Number.isNaN(priorityA) || Number.isNaN(priorityB)) {
      return 1;
    }

    if (priorityA > priorityB) {
      return -1;
    }

    return 1;
  });
};

const generateApiRateLimitConfigFromEndpoint = (envVar: NodeJS.ProcessEnv, endpointKeys: string[]): IApiRateLimitConfig => {
  const apiRateLimitConfig: IApiRateLimitConfig = {};
  endpointKeys.forEach((key) => {

    const endpoint = envVar[key];

    if (endpoint === undefined || Object.keys(apiRateLimitConfig).includes(endpoint)) {
      return;
    }

    const target = key.replace(/^API_RATE_LIMIT_/, '').replace(/_ENDPOINT$/, '');
    const method = envVar[`API_RATE_LIMIT_${target}_METHODS`] ?? 'ALL';
    const consumePoints = Number(envVar[`API_RATE_LIMIT_${target}_CONSUME_POINTS`]);

    if (endpoint === undefined || consumePoints === undefined) {
      return;
    }

    const config = {
      method,
      consumePoints,
    };

    apiRateLimitConfig[endpoint] = config;
  });

  return apiRateLimitConfig;
};

// this method is called only one server starts
export const generateApiRateLimitConfig = (): IApiRateLimitConfig => {
  const envVar = process.env;

  const apiRateEndpointKeys = Object.keys(envVar).filter((key) => {
    const endpointRegExp = /^API_RATE_LIMIT_.*_ENDPOINT/;
    return endpointRegExp.test(key);
  });

  // sort priority
  const apiRateEndpointKeysSorted = sortApiRateEndpointKeys(apiRateEndpointKeys);

  // get config
  const apiRateLimitConfig = generateApiRateLimitConfigFromEndpoint(envVar, apiRateEndpointKeysSorted);

  // default setting e.g. healthchack
  apiRateLimitConfig['/_api/v3/healthcheck'] = {
    method: 'GET',
    consumePoints: 0,
  };

  return apiRateLimitConfig;
};
