import { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:middleware:api-rate-limit');

module.exports = (crowi, rateLimiter) => {

  // API_RATE_LIMIT_010_FOO_ENDPOINT=/_api/v3/foo
  // API_RATE_LIMIT_010_FOO_METHODS=GET,POST
  // API_RATE_LIMIT_010_FOO_CONSUME_POINTS=100

  return (req: Request, res: Response, next: NextFunction) => {

    const endpoint = req.url.replace(/\?.*$/, '');
    const key = req.ip + endpoint;

    const defaultPoints = 10;

    const consumePoints = (points: number = defaultPoints) => {
      rateLimiter.consume(key, points)
        .then((rateLimiterRes) => {
          logger.info(`${key}: consume 2 points!!!`);
          next();
        })
        .catch((rateLimiterRes) => {
          logger.error(`${key}: point is not enough!`);
          next();
        });
      next();
    };

    // pick up API_RATE_LIMIT_*_ENDPOINT from env var
    const apiRateEndpointKeys = Object.keys(process.env).filter((key) => {
      const endpointRegExp = /^API_RATE_LIMIT_*_ENDPOINT/;
      return endpointRegExp.test(key);
    });

    const matchedEndpointKeys = apiRateEndpointKeys.filter((key) => {
      return process.env[key] === endpoint;
    });

    // return default
    if (matchedEndpointKeys.length === 0) {
      logger.info(`endpoint: ${endpoint} => return default api limit1`);
      consumePoints();
    }


    let prioritizedTarget: [string, string] | null = null; // priprity and keyword
    matchedEndpointKeys.forEach((key) => {
      const target = key.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
      const priority = target.split('_')[0];
      const keyword = target.split('_')[1];
      if (prioritizedTarget === null || Number(priority) > Number(prioritizedTarget[0])) {
        prioritizedTarget = [priority, keyword];
      }
    });

    if (prioritizedTarget === null) {
      logger.info(`endpoint: ${endpoint} => return default api limit2`);
      consumePoints();
      return; // delete and find solution
    }

    const targetMethodsKey = `API_RATE_LIMIT_${prioritizedTarget[0]}_${prioritizedTarget[1]}_METHODS`;
    const targetConsumePointsKey = `API_RATE_LIMIT_${prioritizedTarget[0]}_${prioritizedTarget[1]}_CONSUME_POINTS`;

    const targetMethods = process.env[targetMethodsKey];
    if (targetMethods === undefined || targetMethods.includes(req.method)) {
      consumePoints();
    }

    const customizedConsumePoints = process.env[targetConsumePointsKey];
    if (typeof customizedConsumePoints !== 'number') {
      consumePoints();
    }

    consumePoints(Number(customizedConsumePoints));
  };
};
