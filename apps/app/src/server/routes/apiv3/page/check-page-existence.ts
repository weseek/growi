import type { IPage, IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { query } from 'express-validator';
import mongoose from 'mongoose';

import type Crowi from '~/server/crowi';
import type { PageModel } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:page:check-page-existence');


type ReqQuery = {
  path: string,
}

interface Req extends Request<ReqQuery, ApiV3Response> {
  user: IUserHasId,
}

type CreatePageHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const checkPageExistenceHandlersFactory: CreatePageHandlersFactory = (crowi) => {
  const Page = mongoose.model<IPage, PageModel>('Page');

  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../../middlewares/login-required')(crowi, true);

  // define validators for req.body
  const validator: ValidationChain[] = [
    query('path').isString().withMessage('The param "path" must be specified'),
  ];

  return [
    accessTokenParser, loginRequired,
    validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const { path } = req.query;

      if (path == null || Array.isArray(path)) {
        return res.apiv3Err(new ErrorV3('The param "path" must be an page id'));
      }

      const count = await Page.countByPathAndViewer(path.toString(), req.user);
      res.apiv3({ isExist: count > 0 });
    },
  ];
};
