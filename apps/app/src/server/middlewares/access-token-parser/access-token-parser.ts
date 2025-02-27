import type { IUser, IUserHasId } from '@growi/core/dist/interfaces';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import type { NextFunction, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

import type { IAccessToken } from '~/server/models/access-token';
import loggerFactory from '~/utils/logger';

import type { AccessTokenParserReq } from './interfaces';

const logger = loggerFactory('growi:middleware:access-token-parser');


export const accessTokenParser = async(req: AccessTokenParserReq, res: Response, next: NextFunction): Promise<void> => {
  // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
  const accessToken = req.query.access_token ?? req.body.access_token;
  if (accessToken == null || typeof accessToken !== 'string') {
    return next();
  }

  const User = mongoose.model<HydratedDocument<IUser>, { findUserByIds }>('User');
  const AccessToken = mongoose.model<HydratedDocument<IAccessToken>, { findUserIdByToken }>('AccessToken');

  logger.debug('accessToken is', accessToken);

  const userId = await AccessToken.findUserIdByToken(accessToken);
  const user: IUserHasId = await User.findUserByIds(userId);

  if (user == null) {
    logger.debug('The access token is invalid');
    return next();
  }

  // transforming attributes
  req.user = serializeUserSecurely(user);

  logger.debug('Access token parsed.');

  return next();
};
