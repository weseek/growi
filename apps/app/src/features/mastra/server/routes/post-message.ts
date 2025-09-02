import type { IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { body, type ValidationChain } from 'express-validator';

import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { mastra } from '../services';

const logger = loggerFactory('growi:routes:apiv3:mastra:post-message-handler');

type ReqBody = {
  userMessage: string,
}

type Req = Request<any, Response, ReqBody> & {
  user: IUserHasId,
}

type PostMessageHandlersFactory = () => RequestHandler[];


export const postMessageHandlersFactory: PostMessageHandlersFactory = () => {
  const validator: ValidationChain[] = [
    body('userMessage')
      .isString()
      .withMessage('userMessage must be string'),
  ];

  return [...validator, apiV3FormValidator, async(req: Req, res: ApiV3Response) => {
    const { userMessage } = req.body;

    const agent = mastra.getAgent('chatAgent');

    try {
      const result = await agent.generateVNext(userMessage);
      return res.apiv3({ output: result.text });
    }

    catch (error) {
      logger.error(error);
      return res.apiv3Err(new ErrorV3('Failed to post message'));
    }
  },
  ];
};
