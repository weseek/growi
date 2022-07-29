import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';

import PasswordResetOrder, { IPasswordResetOrder } from '../models/password-reset-order';

export type ReqWithPasswordResetOrder = Request & {
  passwordResetOrder: IPasswordResetOrder,
};

export default async(req: ReqWithPasswordResetOrder, res: Response, next: NextFunction): Promise<void> => {
  const token = req.params.token || req.body.token;

  if (token == null) {
    return next(createError(400, 'Token not found', { code: 'token-not-found' }));
  }

  const passwordResetOrder = await PasswordResetOrder.findOne({ token });

  // check if the token is valid
  if (passwordResetOrder == null) {
    return next(createError(400, 'passwordResetOrder is null or expired or revoked', { code: 'password-reset-order-is-not-appropriate' }));
  }

  req.passwordResetOrder = passwordResetOrder;

  return next();
};
