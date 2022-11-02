import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

import UserRegistrationOrder, { IUserRegistrationOrder } from '../models/user-registration-order';

export type ReqWithUserRegistrationOrder = Request & {
  userRegistrationOrder: IUserRegistrationOrder
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async(req: ReqWithUserRegistrationOrder, res: Response, next: NextFunction): Promise<void> => {
  const token = req.params.token || req.body.token;

  if (token == null) {
    return next(createError(400, 'Token not found', { code: 'token-not-found' }));
  }

  const userRegistrationOrder = await UserRegistrationOrder.findOne({ token });

  // check if the token is valid
  if (userRegistrationOrder == null || userRegistrationOrder.isExpired() || userRegistrationOrder.isRevoked) {
    return next(createError(400, 'userRegistrationOrder is null or expired or revoked', { code: 'user-registration-order-is-not-appropriate' }));
  }

  req.userRegistrationOrder = userRegistrationOrder;

  return next();
};
