import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import { ReqWithPasswordResetOrder } from '../middlewares/inject-reset-order-by-token-middleware';

export const userActivation = (req: ReqWithPasswordResetOrder, res: Response): void => {
  console.log('grunelog forgot-password.userActivation');
  console.log(req);
  const { passwordResetOrder } = req;
  return res.render('user-activation', { passwordResetOrder });
};

// middleware to handle error
export const handleHttpErrosMiddleware = (error: Error & { code: string }, req: Request, res: Response, next: NextFunction): Promise<RequestHandler> | void => {
  console.log(error);
  if (error != null) {
    // TODO: grune - make custom view
    return res.render('forgot-password/error', { key: error.code });
  }
  next();
};
