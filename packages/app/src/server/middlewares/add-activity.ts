import { NextFunction, Request, Response } from 'express';

import { IUserHasId } from '~/interfaces/user';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:middlewares:add-activity');


interface AuthorizedRequest extends Request {
  user?: IUserHasId
}

export const generateAddActivityMiddleware = crowi => async(req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> => {
  const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  const path = req.originalUrl;
  const user = req.user;

  const parameter = {
    ip,
    path,
    user: user?._id,
    snapshot: {
      username: user?.username,
    },
  };

  try {
    const activity = await crowi.activityService.createByParameters(parameter);
    res.locals.activity = activity;
  }
  catch (err) {
    logger.error('Create activity failed', err);
  }

  next();
};
