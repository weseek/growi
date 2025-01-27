import { type IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:get-ai-assistants');

type GetAiAssistantsFactory = (crowi: Crowi) => Promise<RequestHandler[]>;

type Req = Request<undefined, Response, undefined> & {
  user: IUserHasId,
}

export const getAiAssistantsFactory: GetAiAssistantsFactory = async(crowi) => {
  const loginRequiredStrictly = (await import('~/server/middlewares/login-required')).default(crowi);

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService,
    async(req: Req, res: ApiV3Response) => {
      try {
        const openaiService = getOpenaiService();
        const accessibleAiAssistants = await openaiService?.getAccessibleAiAssistants(req.user);

        return res.apiv3({ accessibleAiAssistants });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to get AiAssistants'));
      }
    },
  ];
};
