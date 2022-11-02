import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

import loggerFactory from '~/utils/logger';

import UserRegistrationOrder, { IUserRegistrationOrder } from '../models/user-registration-order';

const logger = loggerFactory('growi:routes:user-activation');

export type ReqWithUserRegistrationOrder = Request & {
  userRegistrationOrder: IUserRegistrationOrder
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async(req: ReqWithUserRegistrationOrder, res: Response, next: NextFunction): Promise<void> => {
  const token = req.params.token || req.body.token;

  if (token == null) {
    const msg = 'Token not found';
    logger.error(msg);
    return next(createError(400, msg, { code: 'token-not-found' }));
  }

  const userRegistrationOrder = await UserRegistrationOrder.findOne({ token });

  // check if the token is valid
  if (userRegistrationOrder == null || userRegistrationOrder.isExpired() || userRegistrationOrder.isRevoked) {
    const msg = 'userRegistrationOrder is null or expired or revoked';
    logger.error(msg);
    return next(createError(400, msg, { code: 'user-registration-order-is-not-appropriate' }));
  }

  req.userRegistrationOrder = userRegistrationOrder;

  return next();
};
