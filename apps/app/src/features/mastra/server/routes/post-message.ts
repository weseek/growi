import util from 'util';

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

    // const agent = mastra.getAgent('fileSearchAgent');

    const workflow = mastra.getWorkflow('fileSearchWorkflow');
    const run = workflow.createRun();

    try {

      const stream = run.streamVNext({ inputData: { prompt: userMessage } });

      for await (const chunk of stream) {
        if (chunk?.payload?.output?.type === 'pre-message-event' || chunk?.payload?.output?.type === 'file-search-event') {
          // console.log(chunk?.payload?.output?.text);
          const text = chunk?.payload?.output?.text;
          // console._stdout.write(text);
          console.log('text:', text);
        }
      }


      // console.dir(result, { depth: null });


      // const stream = await agent.streamVNext(userMessage);

      // for await (const chunk of stream.fullStream) {
      //   if (chunk?.payload?.output?.type === 'file-search-event') {
      //     console.log(chunk.payload.output.text)
      //   }
      // }

      // for await (const chunk of stream) {
      //    console.log(chunk);
      // }

      // let fullText = '';
      // for await (const chunk of stream) {
      //   console.log(chunk);
      //   fullText += chunk;
      // }

      // console.log('fullText:', fullText);
      return res.apiv3({});
    }

    catch (error) {
      logger.error(error);
      if (!res.headersSent) {
        return res.apiv3Err(new ErrorV3('Failed to post message'));
      }
    }
  },
  ];
};
