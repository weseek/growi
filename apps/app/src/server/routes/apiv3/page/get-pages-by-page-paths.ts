import type { IPage, IUserHasId } from '@growi/core';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { query } from 'express-validator';
import mongoose from 'mongoose';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import type { PageModel } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:page:get-pages-by-page-paths');

type GetPageByPagePaths = (crowi: Crowi) => RequestHandler[];

type ReqQuery = {
  paths: string[],
}

interface Req extends Request<undefined, ApiV3Response, undefined, ReqQuery> {
  user: IUserHasId,
}
export const getPagesByPagePaths: GetPageByPagePaths = (crowi) => {
  const Page = mongoose.model<IPage, PageModel>('Page');
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  // define validators for req.params
  const validator: ValidationChain[] = [
    query('paths').isArray().withMessage('paths must be an array of strings'),
    query('paths.*') // each item of paths
      .isString()
      .withMessage('paths must be an array of strings'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly,
    validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const { paths } = req.query;
      try {
        const pages = await Page.findByPathsAndViewer(paths, req.user, null, true);
        return res.apiv3({ pages });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
