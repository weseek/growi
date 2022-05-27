import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import loggerFactory from '~/utils/logger';

import { generateApiRateLimitConfig } from '../util/generateApiRateLimitConfig';


const logger = loggerFactory('growi:middleware:api-rate-limit');

const defaultMaxPoints = 100;
const defaultConsumePoints = 10;
const defaultDuration = 1;
const opts = {
  points: defaultMaxPoints, // set default value
  duration: defaultDuration, // set default value
};
const rateLimiter = new RateLimiterMemory(opts);

// generate ApiRateLimitConfig for api rate limiter
const apiRateLimitConfig = generateApiRateLimitConfig();

const consumePoints = async(rateLimiter: RateLimiterMemory, key: string, points: number, next: NextFunction) => {
  await rateLimiter.consume(key, points)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.error(`too many request at ${key}`);
    });
};

module.exports = () => {

  return async(req: Request, res: Response, next: NextFunction) => {

    const endpoint = req.path;
    const key = req.ip + endpoint;

    let points = defaultConsumePoints;
    Object.keys(apiRateLimitConfig).forEach((endpointInConfig) => {
      if (endpointInConfig === endpoint) {
        const consumePointsInConfig = apiRateLimitConfig[endpointInConfig].consumePoints;
        points = consumePointsInConfig;
      }
    });

    await consumePoints(rateLimiter, key, points, next);
    return;
  };
};
