import { IApiRateLimitConfig } from '../../interfaces/api-rate-limit-config';

// strict config

const defaultStrictMaxRequests = 1; // per second

const defaultStrictConfigKey: IApiRateLimitConfig = {
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
  '/forgot-password/:token': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
  '/user-activation/:token': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
  '/user-activation/register': {
    method: 'POST',
    maxRequests: defaultStrictMaxRequests,
  },
  '/download/:id([0-9a-z]{24})': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
  '/share/:linkId': {
    method: 'GET',
    maxRequests: defaultStrictMaxRequests,
  },
};


// infinity config

const defaultInfinityConfigKey: IApiRateLimitConfig = {
  '/_api/v3/healthcheck': {
    method: 'GET',
    maxRequests: Infinity,
  },
};


export default { ...defaultStrictConfigKey, ...defaultInfinityConfigKey };
