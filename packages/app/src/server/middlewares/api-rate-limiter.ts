import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import loggerFactory from '~/utils/logger';

import { IApiRateLimitConfig } from '../interfaces/api-rate-limit-config';

const logger = loggerFactory('growi:middleware:api-rate-limit');

const consumePoints = async(rateLimiter: RateLimiterMemory, key: string, points: number, next: NextFunction) => {
  await rateLimiter.consume(key, points)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.error(`too many request at ${key}`);
    });
};

module.exports = (rateLimiter: RateLimiterMemory, defaultPoints: number, apiRateLimitConfig: IApiRateLimitConfig) => {

  return async(req: Request, res: Response, next: NextFunction) => {

    const endpoint = req.path;
    const key = req.ip + req.url;

    let points;
    Object.keys(apiRateLimitConfig).forEach((endpointInConfig) => {
      if (endpointInConfig === endpoint) {
        const consumePointsInConfig = apiRateLimitConfig[endpointInConfig].consumePoints;
        points = consumePointsInConfig;
      }
      else {
        points = defaultPoints;
      }
    });

    await consumePoints(rateLimiter, key, points, next);
    return;
  };
};
