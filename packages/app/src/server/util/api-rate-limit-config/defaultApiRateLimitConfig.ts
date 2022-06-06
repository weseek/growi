import { IApiRateLimitConfig } from '../../interfaces/api-rate-limit-config';

// strict config
const defaultStrictMaxRequests = 1; // per second
const defaultStrictConfig: IApiRateLimitConfig = {
  '/login/activateInvited': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
  '/login': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
  '/register': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
  '/installer': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
  '/_api/login/testLdap': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
  '/user-activation/register': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
};


// infinity config
const defaultInfinityConfig: IApiRateLimitConfig = {
  '/_api/v3/healthcheck': {
    method: 'GET',
    maxRequests: Infinity,
  },
};

// default config without reg exp
export const defaultConfig = { ...defaultStrictConfig, ...defaultInfinityConfig };

// default config with reg exp
export const defaultConfigWithRegExp = {
  '/forgot-password/.*': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
  '/user-activation/.*': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
  '/download/[0-9a-z]{24}': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
  '/share/[0-9a-z]{24}': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
};
