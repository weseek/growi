import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import createError from 'http-errors';

import loggerFactory from '~/utils/logger';

import { ReqWithPasswordResetOrder } from '../middlewares/inject-reset-order-by-token-middleware';

const logger = loggerFactory('growi:routes:forgot-password');


type Crowi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextApp: any,
}

type CrowiReq = Request & {
  crowi: Crowi,
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const checkForgotPasswordEnabledMiddlewareFactory = (crowi: any, forApi = false) => {

  return (req: Request, res: Response, next: NextFunction): void => {
    const isPasswordResetEnabled = crowi.configManager.getConfig('crowi', 'security:passport-local:isPasswordResetEnabled') as boolean | null;
    const isLocalStrategySetup = crowi.passportService.isLocalStrategySetup as boolean ?? false;

    const isEnabled = isLocalStrategySetup && isPasswordResetEnabled;

    if (!isEnabled) {
      const message = 'Forgot-password function is unavailable because neither LocalStrategy and LdapStrategy is not setup.';
      logger.error(message);

      const statusCode = forApi ? 405 : 404;
      return next(createError(statusCode, message, { code: 'password-reset-is-unavailable' }));
    }

    next();
  };

};

export const forgotPassword = (crowi: any) => {
  return (req: CrowiReq, res: Response): void => {
    const { nextApp } = crowi;
    req.crowi = crowi;
    nextApp.render(req, res, '/forgot-password');
  };
};

export const resetPassword = (req: ReqWithPasswordResetOrder, res: Response): void => {
  const { passwordResetOrder } = req;
  return res.render('reset-password', { email: passwordResetOrder.email });
};

// middleware to handle error
export const handleErrosMiddleware = (error: Error & { code: string }, req: Request, res: Response, next: NextFunction): Promise<RequestHandler> | void => {
  if (error != null) {
    return res.render('forgot-password/error', { key: error.code });
  }
  next(error);
};
