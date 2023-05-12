import { ErrorV3 } from '@growi/core';
import { NextFunction, Response } from 'express';
import { Request } from 'express-validator/src/base';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middleware:exclude-read-only-user');

export const excludeReadOnlyUser = (req: Request, res: Response & { apiv3Err }, next: () => NextFunction): NextFunction => {
  const user = req.user;

  if (user.readOnly) {
    const message = 'This user is read only user';
    logger.warn(message);

    return res.apiv3Err(new ErrorV3(message, 'validatioin_failed'));
  }

  return next();
};
