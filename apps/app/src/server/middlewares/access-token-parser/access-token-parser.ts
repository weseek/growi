import type { IUser, IUserHasId } from '@growi/core/dist/interfaces';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import type { NextFunction, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

import type { Scope } from '~/interfaces/scope';
import { AccessToken } from '~/server/models/access-token';
import loggerFactory from '~/utils/logger';

import type { AccessTokenParserReq } from './interfaces';

const logger = loggerFactory('growi:middleware:access-token-parser');


export const accessTokenParser = (scopes?: Scope[]) => {
  return async(req: AccessTokenParserReq, res: Response, next: NextFunction): Promise<void> => {
  // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    const accessToken = req.query.access_token ?? req.body.access_token;
    if (accessToken == null || typeof accessToken !== 'string') {
      return next();
    }

    logger.debug('accessToken is', accessToken);

    // check the api token is valid
    const User = mongoose.model<HydratedDocument<IUser>, { findUserByApiToken }>('User');
    const userByApiToken: IUserHasId = await User.findUserByApiToken(accessToken);
    if (userByApiToken != null) {
      req.user = serializeUserSecurely(userByApiToken);
      logger.debug('API token parsed.');
      return next();
    }

    // check the access token is valid
    const userId = await AccessToken.findUserIdByToken(accessToken, scopes);
    if (userId == null) {
      logger.debug('The access token is invalid');
      return next();
    }

    // check the user is valid
    const { user }: {user: IUserHasId} = await userId.populate('user');
    if (user == null) {
      logger.debug('The access token\'s associated user is invalid');
      return next();
    }

    // transforming attributes
    req.user = serializeUserSecurely(user);

    logger.debug('Access token parsed.');

    return next();
  };
};
