import { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:middleware:api-rate-limit');

module.exports = (crowi, rateLimiter) => {

  return (req: Request, res: Response, next: NextFunction) => {

    // delete param from url
    const endpoint = req.url.replace(/\?.*$/, '');
    const key = req.ip + endpoint;

    rateLimiter.consume(key, 2) // consume 2 points
      .then((rateLimiterRes) => {
        // 2 points consumed
        logger.info(`${key}: consume 2 points!!!`);
        next();
      })
      .catch((rateLimiterRes) => {
        // Not enough points to consume
        logger.error(`${key}: point is not enough!`);
        next();
      });


    // get config from env

    // consume each point

    // return error if point is not enough
  };
};
