import { IApiRateLimitConfig } from '../interfaces/api-rate-limit-config';

const getKeyByValue = (object: Record<string, string>, value: string): string | undefined => {
  return Object.keys(object).find(key => object[key] === value);
};

const getHighPriorityKey = (key1: string, key2: string): string => {
  const key1Target = key1.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
  const key1Priority = Number(key1Target.split('_')[0]);

  const key2Target = key2.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
  const key2Priority = Number(key2Target.split('_')[0]);

  if (key1Priority > key2Priority) {
    return key1;
  }

  return key2;
};

// this method is called only one server starts
export const generateApiRateLimitConfig = (): IApiRateLimitConfig => {
  const envVar = process.env;

  const apiRateEndpointKeys = Object.keys(envVar).filter((key) => {
    const endpointRegExp = /^API_RATE_LIMIT_.*_ENDPOINT/;
    return endpointRegExp.test(key);
  });

  // pick up API_RATE_LIMIT_*_ENDPOINT from ENV
  const envVarEndpoint: Record<string, string> = {};
  apiRateEndpointKeys.forEach((key) => {
    const value = envVar[key];
    if (value === undefined) { return }
    envVarEndpoint[key] = value;
  });


  // filter the same endpoint configs
  const envVarEndpointFiltered: Record<string, string> = {};
  apiRateEndpointKeys.forEach((key) => {
    const endpointValue = envVarEndpoint[key];
    if (endpointValue === undefined) { return }
    if (Object.values(envVarEndpoint).includes(endpointValue)) {
      const existingKey = getKeyByValue(envVarEndpoint, endpointValue);
      if (existingKey === undefined) { return }
      const highPriorityKey = getHighPriorityKey(key, existingKey);
      envVarEndpointFiltered[highPriorityKey] = endpointValue;
    }
    else {
      envVarEndpointFiltered[key] = endpointValue;
    }
  });

  const apiRateLimitConfig: IApiRateLimitConfig = {};
  Object.keys(envVarEndpointFiltered).forEach((key) => {
    const target = key.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
    const endpoint = envVarEndpointFiltered[`API_RATE_LIMIT_${target}_ENDPOINT`];
    const method = envVar[`API_RATE_LIMIT_${target}_METHODS`];
    const consumePoints = Number(envVar[`API_RATE_LIMIT_${target}_CONSUME_POINTS`]);

    if (endpoint === undefined || method === undefined || consumePoints) { return }

    const config = {
      method,
      consumePoints,
    };

    apiRateLimitConfig[endpoint] = config;
  });

  // default setting e.g. healthchack
  apiRateLimitConfig['/_api/v3/healthcheck'] = {
    method: 'GET',
    consumePoints: 0,
  };

  return apiRateLimitConfig;
};
