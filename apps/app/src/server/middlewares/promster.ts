import {
  Request, Response, NextFunction,
} from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:promster');

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function middleware(crowi: any, app): Middleware {
  const { configManager } = crowi;

  // when disabled
  if (!configManager.getConfig('crowi', 'promster:isEnabled')) {
    return (req, res, next) => next();
  }

  logger.info('Promster is enabled');

  const { createMiddleware } = require('@promster/express');
  return createMiddleware({ app });
}

module.exports = middleware;
