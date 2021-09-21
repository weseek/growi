import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import { ReqWithPasswordResetOrder } from '../middlewares/inject-reset-order-by-token-middleware';

export const forgotPassword = (req: Request, res: Response): void => {
  return res.render('forgot-password');
};

export const resetPassword = (req: ReqWithPasswordResetOrder, res: Response): void => {
  const { passwordResetOrder } = req;
  return res.render('reset-password', { email: passwordResetOrder.email });
};

// middleware to handle error
export const handleHttpErrosMiddleware = (error: Error & { code: string }, req: Request, res: Response, next: NextFunction): Promise<RequestHandler> | void => {
  if (error != null) {
    return res.render('forgot-password/error', { key: error.code });
  }
  next();
};
