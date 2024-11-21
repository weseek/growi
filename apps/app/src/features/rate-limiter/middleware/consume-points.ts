import { type RateLimiterMongo, type RateLimiterRes } from 'rate-limiter-flexible';

import { DEFAULT_MAX_REQUESTS, type IApiRateLimitConfig } from '../config';

export const consumePoints = async(
    rateLimiter: RateLimiterMongo, method: string, key: string | null, customizedConfig?: IApiRateLimitConfig, maxRequestsMultiplier?: number,
): Promise<RateLimiterRes | undefined> => {
  if (key == null) {
    return;
  }

  let maxRequests = DEFAULT_MAX_REQUESTS;

  // use customizedConfig
  if (customizedConfig != null && (customizedConfig.method.includes(method) || customizedConfig.method === 'ALL')) {
    maxRequests = customizedConfig.maxRequests;
  }

  // multiply
  if (maxRequestsMultiplier != null) {
    maxRequests *= maxRequestsMultiplier;
  }

  rateLimiter.points = maxRequests;
  const rateLimiterRes = await rateLimiter.consume(key, 1);
  return rateLimiterRes;
};
