import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import loggerFactory from '~/utils/logger';

import getCustomApiRateLimit from '../util/getCustomApiRateLimit';


const logger = loggerFactory('growi:middleware:api-rate-limit');

// e.g.
// API_RATE_LIMIT_010_FOO_ENDPOINT=/_api/v3/foo
// API_RATE_LIMIT_010_FOO_METHODS=GET,POST
// API_RATE_LIMIT_010_FOO_CONSUME_POINTS=10

const consumePoints = async(rateLimiter: RateLimiterMemory, key: string, points: number, next: NextFunction) => {
  await rateLimiter.consume(key, points)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.error(`too many request at ${key}`);
    });
};

module.exports = (rateLimiter: RateLimiterMemory, defaultPoints: number, envVarDicForApiRateLimiter: {[key: string]: string}) => {

  return async(req: Request, res: Response, next: NextFunction) => {

    const endpoint = req.path;
    const key = req.ip + req.url;

    const matchedEndpointKeys = Object.keys(envVarDicForApiRateLimiter).filter((key) => {
      return envVarDicForApiRateLimiter[key] === endpoint;
    });

    if (matchedEndpointKeys.length === 0) {
      await consumePoints(rateLimiter, key, defaultPoints, next);
      return;
    }

    const customizedConsumePoints = getCustomApiRateLimit(matchedEndpointKeys, req.method, envVarDicForApiRateLimiter);

    await consumePoints(rateLimiter, key, customizedConsumePoints ?? defaultPoints, next);
    return;
  };
};
