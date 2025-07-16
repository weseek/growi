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


const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (authHeader == null) {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

export const accessTokenParser = async(req: AccessTokenParserReq, res: Response, next: NextFunction): Promise<void> => {
  // Extract token from Authorization header first
  const bearerToken = extractBearerToken(req.headers.authorization);

  // Try all possible token sources in order of priority
  const accessToken = bearerToken ?? req.query.access_token ?? req.body.access_token;

  if (accessToken == null || typeof accessToken !== 'string') {
    return next();
  }

  const User = mongoose.model<HydratedDocument<IUser>, { findUserByApiToken }>('User');

  logger.debug('accessToken is', accessToken);

  const user: IUserHasId = await User.findUserByApiToken(accessToken);

  if (user == null) {
    logger.debug('The access token is invalid');
    return next();
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
