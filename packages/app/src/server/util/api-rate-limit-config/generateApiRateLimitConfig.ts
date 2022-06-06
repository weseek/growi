import { IApiRateLimitConfig } from '../../interfaces/api-rate-limit-config';

import { defaultConfigWithoutRegExp, defaultConfigWithRegExp } from './defaultApiRateLimitConfig';

const envVar = process.env;

const getTargetFromKey = (key: string, withRegExp: boolean): string|null => {
  const regExp = new RegExp(withRegExp ? '^API_RATE_LIMIT_|_ENDPOINT_WITH_REGEXP$' : '^API_RATE_LIMIT_|_ENDPOINT$', 'g');
  if (!regExp.test(key)) {
    return null;
  }
  const target = key.replaceAll(regExp, '');
  return target;
};

const generateApiRateLimitConfigFromEndpoint = (envVar: NodeJS.ProcessEnv, targets: string[], withRegExp: boolean): IApiRateLimitConfig => {
  const apiRateLimitConfig: IApiRateLimitConfig = {};
  targets.forEach((target) => {

    const endpointKey = withRegExp ? `API_RATE_LIMIT_${target}_ENDPOINT_WITH_REGEXP` : `API_RATE_LIMIT_${target}_ENDPOINT`;

    const endpoint = envVar[endpointKey];

    if (endpoint == null) {
      return;
    }
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

  const apiRateConfigTargets: string[] = [];
  Object.keys(envVar).forEach((key) => {
    const target = getTargetFromKey(key, withRegExp);
    if (target == null) {
      return;
    }
    apiRateConfigTargets.push(target);
  });

  // sort priority
  apiRateConfigTargets.sort();

  // get config
  const apiRateLimitConfig = generateApiRateLimitConfigFromEndpoint(envVar, apiRateConfigTargets, withRegExp);

  const defaultConfig = withRegExp ? defaultConfigWithRegExp : defaultConfigWithoutRegExp;

  return { ...defaultConfig, ...apiRateLimitConfig };
};
