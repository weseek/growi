import { IApiRateLimitConfig } from '../../interfaces/api-rate-limit-config';

import { defaultConfigWithoutRegExp, defaultConfigWithRegExp } from './defaultApiRateLimitConfig';

const envVar = process.env;

const getTargetFromKey = (key: string, withRegExp: boolean) => {
  if (withRegExp) {
    return key.replace(/^API_RATE_LIMIT_/, '').replace(/_ENDPOINT_WITH_REGEXP$/, '');
  }
  return key.replace(/^API_RATE_LIMIT_/, '').replace(/_ENDPOINT$/, '');
};

const generateApiRateLimitConfigFromEndpoint = (envVar: NodeJS.ProcessEnv, endpointKeys: string[], withRegExp: boolean): IApiRateLimitConfig => {
  const apiRateLimitConfig: IApiRateLimitConfig = {};
  endpointKeys.forEach((key) => {

    const endpoint = envVar[key];

    if (endpoint == null || Object.keys(apiRateLimitConfig).includes(endpoint)) {
      return;
    }

    const target = getTargetFromKey(key, withRegExp);
    const methodKey = `API_RATE_LIMIT_${target}_METHODS`;
    const maxRequestsKey = `API_RATE_LIMIT_${target}_MAX_REQUESTS`;
    const method = envVar[methodKey] ?? 'ALL';
    const maxRequests = Number(envVar[maxRequestsKey]);

    if (endpoint == null || maxRequests == null) {
      return;
    }

    const config = {
      method,
      maxRequests,
    };

    apiRateLimitConfig[endpoint] = config;
  });

  return apiRateLimitConfig;
};

export const generateApiRateLimitConfig = (withRegExp: boolean): IApiRateLimitConfig => {

  const apiRateEndpointKeys = Object.keys(envVar).filter((key) => {
    const endpointRegExp = withRegExp ? /^API_RATE_LIMIT_\w+_ENDPOINT_WITH_REGEXP/ : /^API_RATE_LIMIT_\w+_ENDPOINT/;
    return endpointRegExp.test(key);
  });

  // sort priority
  apiRateEndpointKeys.sort().reverse();

  // get config
  const apiRateLimitConfig = generateApiRateLimitConfigFromEndpoint(envVar, apiRateEndpointKeys, withRegExp);

  const defaultConfig = withRegExp ? defaultConfigWithRegExp : defaultConfigWithoutRegExp;

  return { ...defaultConfig, ...apiRateLimitConfig };
};
