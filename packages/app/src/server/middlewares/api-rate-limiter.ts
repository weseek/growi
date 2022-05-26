import { NextFunction, Request } from 'express';

import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:middleware:api-rate-limit');


// API_RATE_LIMIT_010_FOO_ENDPOINT=/_api/v3/foo
// API_RATE_LIMIT_010_FOO_METHODS=GET,POST
// API_RATE_LIMIT_010_FOO_CONSUME_POINTS=10

module.exports = (rateLimiter, defaultPoints: number) => {

  return async(req: Request, next: NextFunction) => {

    const endpoint = req.url.replace(/\?.*$/, '');
    const key = req.ip + endpoint;

    const consumePoints = async(points: number = defaultPoints) => {
      await rateLimiter.consume(key, points)
        .then(() => {
          next();
        })
        .catch(() => {
          logger.error(`too many request at ${endpoint}`);
        });
    };

    // pick up API_RATE_LIMIT_*_ENDPOINT from ENV
    const apiRateEndpointKeys = Object.keys(process.env).filter((key) => {
      const endpointRegExp = /^API_RATE_LIMIT_.*_ENDPOINT/;
      return endpointRegExp.test(key);
    });

    const matchedEndpointKeys = apiRateEndpointKeys.filter((key) => {
      return process.env[key] === endpoint;
    });

    if (matchedEndpointKeys.length === 0) {
      await consumePoints();
      return;
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
      await consumePoints();
      return;
    }

    const targetMethodsKey = `API_RATE_LIMIT_${prioritizedTarget[0]}_${prioritizedTarget[1]}_METHODS`;
    const targetConsumePointsKey = `API_RATE_LIMIT_${prioritizedTarget[0]}_${prioritizedTarget[1]}_CONSUME_POINTS`;

    const targetMethods = process.env[targetMethodsKey];
    if (targetMethods === undefined || !targetMethods.includes(req.method)) {
      await consumePoints();
      return;
    }

    const customizedConsumePoints = process.env[targetConsumePointsKey];

    await consumePoints(Number(customizedConsumePoints));
    return;
  };
};
