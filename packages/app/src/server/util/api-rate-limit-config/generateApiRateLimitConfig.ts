import { IApiRateLimitConfig } from '../../interfaces/api-rate-limit-config';

import { defaultConfigWithoutRegExp, defaultConfigWithRegExp } from './defaultApiRateLimitConfig';

const envVar = process.env;

const getTargetFromKey = (key: string, withRegExp: boolean) => {
  // eslint-disable-next-line regex/invalid
  const regExp = new RegExp(withRegExp ? '(?<=API_RATE_LIMIT_).*(?=_ENDPOINT_WITH_REGEXP)' : '(?<=API_RATE_LIMIT_).*(?=_ENDPOINT)');
  return key.match(regExp);
};

const generateApiRateLimitConfigFromEndpoint = (envVar: NodeJS.ProcessEnv, endpointKeys: string[], withRegExp: boolean): IApiRateLimitConfig => {
  const apiRateLimitConfig: IApiRateLimitConfig = {};
  endpointKeys.forEach((key) => {

    const endpoint = envVar[key];

    if (endpoint == null) {
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
    const target = getTargetFromKey(key, withRegExp);
    return target;
  });

  // get config
  const apiRateLimitConfig = generateApiRateLimitConfigFromEndpoint(envVar, apiRateEndpointKeys, withRegExp);

  const defaultConfig = withRegExp ? defaultConfigWithRegExp : defaultConfigWithoutRegExp;

  return { ...defaultConfig, ...apiRateLimitConfig };
};
