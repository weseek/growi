import { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:csrf-guard');

module.exports = () => {

  return async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.rawHeaders.includes('XMLHttpRequest') === true) {
      if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
        if (req.rawHeaders.includes('x-growi-client') === false) {
          logger.error('Request authorization failed');
          return;
        }
      }
    }
    return next();
  };

};
