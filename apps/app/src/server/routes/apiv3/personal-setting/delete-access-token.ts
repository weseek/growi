import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';

import { SupportedAction } from '~/interfaces/activity';
import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { AccessToken } from '~/server/models/access-token';
import loggerFactory from '~/utils/logger';

import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:personal-setting:generate-access-tokens');

type ReqBody = {
  tokenId: string,
}

type DeleteAccessTokenRequest = Request<undefined, ApiV3Response, ReqBody>;

type DeleteAccessTokenHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const deleteAccessTokenHandlersFactory: DeleteAccessTokenHandlersFactory = (crowi) => {

  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);
  const addActivity = generateAddActivityMiddleware();
  const activityEvent = crowi.event('activity');

  return [
    accessTokenParser, loginRequiredStrictly,
    addActivity,
    async(req: DeleteAccessTokenRequest, res: ApiV3Response) => {
      const { body } = req;
      const { tokenId } = body;

      try {
        await AccessToken.deleteTokenById(tokenId);

        const parameters = { action: SupportedAction.ACTION_USER_ACCESS_TOKEN_DELETE };
        activityEvent.emit('update', res.locals.activity._id, parameters);

        return res.apiv3({});
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3(err.toString(), 'delete-access-token-failed'));
      }
    }];
};
