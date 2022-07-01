import { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:csrf-guard');

module.exports = () => {

  return async(req: Request, res: Response<any, Record<string, any>>, next: NextFunction): Promise<any> => {

    // TODO: update after impl login, installer
    try {
      const targetMethods = ['POST', 'PUT', 'DELETE'];
      if (targetMethods.includes(req.method.toUpperCase())) {
        if (req.headers['X-Requested-With'] !== 'XMLHttpRequest') {
          throw new Error('Request authorization failed');
        }
      }

      return next();
    }
    catch (err) {
      logger.error(err.message);
      return res.status(403).json({ err: err.message });
    }
  };

};
