import type { IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { query, type ValidationChain } from 'express-validator';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { mastra } from '../services';

const logger = loggerFactory('growi:routes:apiv3:mastra:get-weather');

type GetWeatherFactory = () => RequestHandler[];

type ReqQuery = {
  city: string;
};

type Req = Request<undefined, Response, undefined, ReqQuery> & {
  user: IUserHasId;
};

export const getWeatherFactory: GetWeatherFactory = () => {
  const validator: ValidationChain[] = [
    query('city').isString().withMessage('city must be string'),
  ];

  return [
    ...validator,
    apiV3FormValidator,
    async (req: Req, res: ApiV3Response) => {
      const { city } = req.query;

      const agent = mastra.getAgent("weatherAgent");

      try {
        const result = await agent.generate(`What's the weather like in ${city}?`);
        console.log('result:', result.text);
        return res.apiv3({ text: result.text });
      }

      catch (error) {
        logger.error(error);
        return res.apiv3Err(new ErrorV3('Failed to get weather data'));
      }

    },
  ];
};
