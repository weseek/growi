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

module.exports = (rateLimiter: RateLimiterMemory, defaultPoints: number) => {

  return async(req: Request, res: Response, next: NextFunction) => {

    // e.g. /_api/v3/page/info?pageId=628c64f2b78c8d7e084ee979 => /_api/v3/page/info
    const endpoint = req.url.replace(/\?.*$/, '');
    const key = req.ip + req.url;

    const envVarDic = process.env;

    // pick up API_RATE_LIMIT_*_ENDPOINT from ENV
    const apiRateEndpointKeys = Object.keys(envVarDic).filter((key) => {
      const endpointRegExp = /^API_RATE_LIMIT_.*_ENDPOINT/;
      return endpointRegExp.test(key);
    });

    const matchedEndpointKeys = apiRateEndpointKeys.filter((key) => {
      return envVarDic[key] === endpoint;
    });

    if (matchedEndpointKeys.length === 0) {
      await consumePoints(rateLimiter, key, defaultPoints, next);
      return;
    }

    const customizedConsumePoints = getCustomApiRateLimit(matchedEndpointKeys, req.method);

    await consumePoints(rateLimiter, key, customizedConsumePoints ?? defaultPoints, next);
    return;
  };
};
