import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

import { UserActivationErrorCode } from '~/interfaces/errors/user-activation';
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
    return next(createError(400, msg, { code: UserActivationErrorCode.TOKEN_NOT_FOUND }));
  }

  const userRegistrationOrder = await UserRegistrationOrder.findOne({ token });

  // check if the token is valid
  if (userRegistrationOrder == null || userRegistrationOrder.isExpired() || userRegistrationOrder.isRevoked) {
    const msg = 'userRegistrationOrder is null or expired or revoked';
    logger.error(msg);
    return next(createError(400, msg, { code: UserActivationErrorCode.USER_REGISTRATION_ORDER_IS_NOT_APPROPRIATE }));
  }

  req.userRegistrationOrder = userRegistrationOrder;

  return next();
};
