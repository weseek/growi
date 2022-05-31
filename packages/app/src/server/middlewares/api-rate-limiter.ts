import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { RateLimiterMongo } from 'rate-limiter-flexible';

import loggerFactory from '~/utils/logger';

import { generateApiRateLimitConfig } from '../util/generateApiRateLimitConfig';


const logger = loggerFactory('growi:middleware:api-rate-limit');

// config sample
// API_RATE_LIMIT_010_FOO_ENDPOINT=/_api/v3/foo
// API_RATE_LIMIT_010_FOO_METHODS=GET,POST
// API_RATE_LIMIT_010_FOO_MAX_REQUESTS=10

const defaultMaxPoints = 100;
const defaultMaxRequests = 10;
const defaultDuration = 1;
const opts = {
  storeClient: mongoose.connection,
  points: defaultMaxPoints, // set default value
  duration: defaultDuration, // set default value
};
const rateLimiter = new RateLimiterMongo(opts);

// generate ApiRateLimitConfig for api rate limiter
const apiRateLimitConfig = generateApiRateLimitConfig();

const consumePoints = async(rateLimiter: RateLimiterMongo, key: string, points: number, next: NextFunction) => {
  const consumePoints = defaultMaxPoints / points;
  await rateLimiter.consume(key, consumePoints)
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

    const customizedConfig = apiRateLimitConfig[endpoint];

    if (customizedConfig === undefined) {
      await consumePoints(rateLimiter, key, defaultMaxRequests, next);
      return;
    }

    if (customizedConfig.method.includes(req.method) || customizedConfig.method === 'ALL') {
      await consumePoints(rateLimiter, key, customizedConfig.maxRequests, next);
      return;
    }

    await consumePoints(rateLimiter, key, defaultMaxRequests, next);
    return;
  };
};
