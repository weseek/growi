import type { IUser, IUserHasId } from '@growi/core/dist/interfaces';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import type { Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';

import type { AccessTokenParserReq } from './interfaces';

const logger = loggerFactory('growi:middleware:access-token-parser:api-token');


export const parserForApiToken = (accessToken: string) => {
  return async(req: AccessTokenParserReq, res: Response): Promise<void> => {
    const User = mongoose.model<HydratedDocument<IUser>, { findUserByApiToken }>('User');
    const userByApiToken: IUserHasId = await User.findUserByApiToken(accessToken);

    if (userByApiToken == null) {
      return;
    }

    req.user = serializeUserSecurely(userByApiToken);
    if (req.user == null) {
      return;
    }

    logger.debug('Access token parsed.');
    return;
  };
};
