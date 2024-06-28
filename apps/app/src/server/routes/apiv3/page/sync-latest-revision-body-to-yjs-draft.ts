import type { IPage, IUserHasId } from '@growi/core';
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

type SyncLatestRevisionBodyToYjsDraftHandlerFactory = (crowi: Crowi) => RequestHandler[];

type ReqParams = {
  pageId: string,
}
interface Req extends Request<ReqParams, ApiV3Response> {
  user: IUserHasId,
}
export const syncLatestRevisionBodyToYjsDraftHandlerFactory: SyncLatestRevisionBodyToYjsDraftHandlerFactory = (crowi) => {
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
    async(req: Req, res: ApiV3Response) => {
      const { pageId } = req.params;

      // check whether accessible
      if (!(await Page.isAccessiblePageByViewer(pageId, req.user))) {
        return res.apiv3Err(new ErrorV3('Current user is not accessible to this page.', 'forbidden-page'), 403);
      }

      try {
        await crowi.pageService.syncLatestRevisionBodyToYjsDraft(pageId);
        return res.apiv3({ });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
