import type { IPage } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { param } from 'express-validator';
import mongoose from 'mongoose';

import type Crowi from '~/server/crowi';
import type { PageModel } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:page:get-yjs-data');

type GetYjsDataHandlerFactory = (crowi: Crowi) => RequestHandler[];

export const getYjsDataHandlerFactory: GetYjsDataHandlerFactory = (crowi) => {
  const Page = mongoose.model<IPage, PageModel>('Page');

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
        const page = await Page.findOne({ _id: pageId });

        if (page == null) {
          return res.apiv3Err(new ErrorV3(`Page ${pageId} is not exist.`), 404);
        }

        const populatedPage = await page.populateDataToShowRevision();
        const revisionBody = populatedPage.revision.body;
        const yjsData = crowi.pageService.getYjsData(pageId, revisionBody);

        return res.apiv3({ yjsData });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
