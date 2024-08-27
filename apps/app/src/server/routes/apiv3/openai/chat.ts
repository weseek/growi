import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { openaiService } from '~/server/service/openai';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:openai:chat');

type ReqBody = {
  userMessage: string,
}

type Req = Request<undefined, ApiV3Response, ReqBody>

type ChatHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const chatHandlersFactory: ChatHandlersFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('userMessage').isString().withMessage('userMessage must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      try {
        const chatCompletion = await openaiService.client.chat.completions.create({
          messages: [{ role: 'assistant', content: req.body.userMessage }],
          model: 'gpt-3.5-turbo-0125',
        });

        return res.apiv3({ assistantMessage: chatCompletion.choices[0].message.content });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
