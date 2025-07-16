import type { IUser, IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import type { NextFunction, Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

import isSimpleRequest from '~/server/util/is-simple-request';
import loggerFactory from '~/utils/logger';

import type { AccessTokenParserReq } from './interfaces';

const logger = loggerFactory('growi:middleware:access-token-parser');

type Apiv3ErrFunction = (error: ErrorV3) => void;

export const accessTokenParser = async(req: AccessTokenParserReq, res: Response & { apiv3Err: Apiv3ErrFunction }, next: NextFunction): Promise<void> => {
  // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
  const accessToken = req.query.access_token ?? req.body.access_token;
  if (accessToken != null && typeof accessToken !== 'string') {
    return res.apiv3Err(new ErrorV3('The access token is invalid'));
  }

  const User = mongoose.model<HydratedDocument<IUser>, { findUserByApiToken }>('User');

  logger.debug('accessToken is', accessToken);

  const user: IUserHasId = await User.findUserByApiToken(accessToken);

  // const isSimpleRequest = isSimpleRequest_(req);

  // CSRF Protection
  if (!req.isSameOriginReq && user == null && !isSimpleRequest(req)) {
    const message = 'Invalid request';
    logger.error(message);
    return res.apiv3Err(new ErrorV3(message));
  }

  if (user == null) {
    logger.debug('The access token is invalid');
    return next();
  }

  // transforming attributes
  req.user = serializeUserSecurely(user);

  logger.debug('Access token parsed.');

  return next();
};
