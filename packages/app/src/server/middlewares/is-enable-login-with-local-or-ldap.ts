import { NextFunction, Request, Response } from 'express';
import { ErrorV3 } from '@growi/core';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:is-enable-login-with-local-or-ldap');


export const generateIsEnableLoginWithLocalOrLdapMiddleware = crowi => async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const passportService = crowi.passportService;

  if (!passportService.isLocalStrategySetup && !passportService.isLdapStrategySetup) {
    logger.error('LocalStrategy and LdapStrategy has not been set up');
    const error = new ErrorV3('message.strategy_has_not_been_set_up', '', undefined, { strategy: 'LocalStrategy and LdapStrategy' });
    return next(error);
  }

  return next();

};
