import type { IUser, IUserHasId } from '@growi/core/dist/interfaces';
import type { IUserSerializedSecurely } from '@growi/core/dist/models/serializers';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import type { NextFunction, Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:middleware:access-token-parser');

type ReqQuery = {
  access_token?: string,
}
type ReqBody = {
  access_token?: string,
}

interface Req extends Request<undefined, undefined, ReqBody, ReqQuery> {
  user: IUserSerializedSecurely<IUserHasId>,
}

const middlewareFactory = () => {

  return async(req: Req, res: Response, next: NextFunction): Promise<void> => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    const accessToken = req.query.access_token ?? req.body.access_token;
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

    // transforming attributes
    req.user = serializeUserSecurely(user);

    logger.debug('Access token parsed.');

    return next();
  };

};

module.exports = middlewareFactory;
// export default middlewareFactory;
