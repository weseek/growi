import type { IUserHasId } from '@growi/core/dist/interfaces';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import type { NextFunction, Response } from 'express';

import type { Scope } from '~/interfaces/scope';
import { AccessToken } from '~/server/models/access-token';
import loggerFactory from '~/utils/logger';

import type { AccessTokenParserReq } from './interfaces';

const logger = loggerFactory('growi:middleware:access-token-parser:access-token');

export const parserForAccessToken = (scopes: Scope[]) => {
  return async(req: AccessTokenParserReq, res: Response, next: NextFunction): Promise<void> => {

    const accessToken = req.query.access_token ?? req.body.access_token;
    if (accessToken == null || typeof accessToken !== 'string') {
      return next();
    }
    if (scopes == null || scopes.length === 0) {
      logger.debug('scopes is empty');
      return;
    }

    // check the access token is valid
    const userId = await AccessToken.findUserIdByToken(accessToken, scopes);
    if (userId == null) {
      logger.debug('The access token is invalid');
      return;
    }

    // check the user is valid
    const { user: userByAccessToken }: {user: IUserHasId} = await userId.populate('user');
    if (userByAccessToken == null) {
      logger.debug('The access token\'s associated user is invalid');
      return;
    }

    // transforming attributes
    req.user = serializeUserSecurely(userByAccessToken);
    if (req.user == null) {
      return;
    }

    logger.debug('Access token parsed.');
    return next();

  };
};
