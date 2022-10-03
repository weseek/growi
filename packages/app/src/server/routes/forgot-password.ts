import {
  NextFunction, Request, Response,
} from 'express';
import createError from 'http-errors';

import { forgotPasswordErrorCode } from '~/interfaces/errors/forgot-password';
import loggerFactory from '~/utils/logger';

import { ReqWithPasswordResetOrder } from '../middlewares/inject-reset-order-by-token-middleware';

const logger = loggerFactory('growi:routes:forgot-password');


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
      return next(createError(statusCode, message, { code: forgotPasswordErrorCode.PASSWORD_RESET_IS_UNAVAILABLE }));
    }

    next();
  };

};

export const forgotPassword = (req: Request, res: Response): void => {
  return res.render('forgot-password');
};

export const resetPassword = (req: ReqWithPasswordResetOrder, res: Response): void => {
  const { passwordResetOrder } = req;
  return res.render('reset-password', { email: passwordResetOrder.email });
};

type Crowi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextApp: any,
}

type CrowiReq = Request & {
  crowi: Crowi,
}

// middleware to handle error
export const handleErrorsMiddleware = (crowi: Crowi) => {
  return (error: Error & { code: string, statusCode: number }, req: CrowiReq, res: Response, next: NextFunction): void => {
    if (error != null) {
      const { nextApp } = crowi;

      req.crowi = crowi;
      res.status(error.statusCode);

      nextApp.render(req, res, '/forgot-password-errors', { errorCode: error.code });
      return;
    }

    next();
  };
};
