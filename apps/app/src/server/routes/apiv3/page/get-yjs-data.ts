import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { param } from 'express-validator';

import type Crowi from '~/server/crowi';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:page:get-yjs-data');

type GetYjsDataHandlerFactory = (crowi: Crowi) => RequestHandler[];

export const getYjsDataHandlerFactory: GetYjsDataHandlerFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  // define validators for req.params
  const validator: ValidationChain[] = [
    param('pageId').isMongoId().withMessage('The param "pageId" must be specified'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly,
    validator, apiV3FormValidator,
    async(req: Request, res: ApiV3Response) => {
      const { pageId } = req.params;

      try {
        const yjsData = await crowi.pageService.getYjsData(pageId);
        return res.apiv3({ yjsData });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
