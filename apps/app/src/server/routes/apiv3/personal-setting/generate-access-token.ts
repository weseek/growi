
import type {
  IUserHasId,
} from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';

import { SupportedAction } from '~/interfaces/activity';
import type Crowi from '~/server/crowi';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { AccessToken } from '~/server/models/access-token';
import loggerFactory from '~/utils/logger';

import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:personal-setting:generate-access-tokens');

type ReqBody = {
  expiredAt: Date,
  description?: string,
  scope?: string[],
}

interface GenerateAccessTokenRequest extends Request<undefined, ApiV3Response, ReqBody> {
  user: IUserHasId,
}


type GenerateAccessTokenHandlerFactory = (crowi: Crowi) => RequestHandler[];

export const generateAccessTokenHandlerFactory: GenerateAccessTokenHandlerFactory = (crowi) => {

  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);
  const activityEvent = crowi.event('activity');
  const addActivity = generateAddActivityMiddleware();


  return [
    loginRequiredStrictly, addActivity,
    async(req: GenerateAccessTokenRequest, res: ApiV3Response) => {

      const { user, body } = req;
      const { expiredAt, description, scope } = body;

      try {
        const tokenData = await AccessToken.generateToken(user._id, expiredAt, scope, description);

        const parameters = { action: SupportedAction.ACTION_USER_ACCESS_TOKEN_CREATE };
        activityEvent.emit('update', res.locals.activity._id, parameters);

        return res.apiv3(tokenData);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3(err.toString(), 'generate-access-token-failed'));
      }
    },
  ];
};
