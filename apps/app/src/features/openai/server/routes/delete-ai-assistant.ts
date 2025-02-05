import { type IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:delete-ai-assistants');


type DeleteAiAssistantsFactory = (crowi: Crowi) => RequestHandler[];

type Req = Request<undefined, Response, undefined> & {
  user: IUserHasId,
}

export const deleteAiAssistantsFactory: DeleteAiAssistantsFactory = (crowi) => {

  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService,
    async(req: Req, res: ApiV3Response) => {
      try {
        return res.apiv3({ });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to delete AiAssistants'));
      }
    },
  ];
};
