import express, { Request, Router } from 'express';
import { query, oneOf } from 'express-validator';

import mongoose from 'mongoose';

import { PageModel } from '../../models/page';
import ErrorV3 from '../../models/vo/error-apiv3';
import loggerFactory from '../../../utils/logger';
import Crowi from '../../crowi';
import { ApiV3Response } from './interfaces/apiv3-response';
import { IPageInfoForList, IPageInfoCommon, isExistPageInfo } from '~/interfaces/page';
import PageService from '../../service/page';

const logger = loggerFactory('growi:routes:apiv3:page-tree');

/*
 * Types & Interfaces
 */
interface AuthorizedRequest extends Request {
  user?: any
}

/*
 * Validators
 */
const validator = {
  pagePathRequired: [
    query('path').isString().withMessage('path is required'),
  ],
  pageIdOrPathRequired: oneOf([
    query('id').isMongoId(),
    query('path').isString(),
  ], 'id or path is required'),
  pageIdsRequired: [
    query('pageIds').isArray().withMessage('pageIds is required'),
  ],
};

/*
 * Routes
 */
export default (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const router = express.Router();


  router.get('/root', accessTokenParser, loginRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const Page: PageModel = crowi.model('Page');

    let rootPage;
    try {
      rootPage = await Page.findByPathAndViewer('/', req.user, null, true);
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3('rootPage not found'));
    }

    return res.apiv3({ rootPage });
  });

  // eslint-disable-next-line max-len
  router.get('/ancestors-children', accessTokenParser, loginRequired, ...validator.pagePathRequired, apiV3FormValidator, async(req: AuthorizedRequest, res: ApiV3Response): Promise<any> => {
    const { path } = req.query;

    const Page: PageModel = crowi.model('Page');

    try {
      const ancestorsChildren = await Page.findAncestorsChildrenByPathAndViewer(path as string, req.user);
      return res.apiv3({ ancestorsChildren });
    }
    catch (err) {
      logger.error('Failed to get ancestorsChildren.', err);
      return res.apiv3Err(new ErrorV3('Failed to get ancestorsChildren.'));
    }

  });

  /*
   * In most cases, using id should be prioritized
   */
  // eslint-disable-next-line max-len
  router.get('/children', accessTokenParser, loginRequired, validator.pageIdOrPathRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { id, path } = req.query;

    const Page: PageModel = crowi.model('Page');

    try {
      const pages = await Page.findChildrenByParentPathOrIdAndViewer((id || path)as string, req.user);
      return res.apiv3({ children: pages });
    }
    catch (err) {
      logger.error('Error occurred while finding children.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while finding children.'));
    }
  });

  // eslint-disable-next-line max-len
  router.get('/info', accessTokenParser, loginRequired, validator.pageIdsRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { pageIds } = req.query;

    const Page = mongoose.model('Page') as unknown as PageModel;
    const Bookmark = crowi.model('Bookmark');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pageService: PageService = crowi.pageService!;

    try {
      const pages = await Page.findByIdsAndViewer(pageIds as string[], req.user, null, true);

      const foundIds = pages.map(page => page._id);

      const shortBodiesMap = await pageService.shortBodiesMapByPageIds(foundIds, req.user);
      const bookmarkCountMap = await Bookmark.getPageIdToCountMap(foundIds) as Record<string, number>;

      const idToPageInfoMap: Record<string, IPageInfoCommon|IPageInfoForList> = {};

      for (const page of pages) {
        // construct IPageInfoForList
        const basicPageInfo = pageService.constructBasicPageInfo(page);

        const pageInfo: IPageInfoCommon | IPageInfoForList = (!isExistPageInfo(basicPageInfo))
          ? basicPageInfo
          // create IPageInfoForList
          : {
            ...basicPageInfo,
            bookmarkCount: bookmarkCountMap[page._id],
            revisionShortBody: shortBodiesMap[page._id],
          } as IPageInfoForList;

        idToPageInfoMap[page._id] = pageInfo;
      }

      return res.apiv3(idToPageInfoMap);
    }
    catch (err) {
      logger.error('Error occurred while fetching page informations.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while fetching page informations.'));
    }
  });

  // eslint-disable-next-line max-len
  router.get('/short-bodies', accessTokenParser, loginRequired, validator.pageIdsRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { pageIds } = req.query;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // const shortBodiesMap = await crowi.pageService!.shortBodiesMapByPageIds(pageIds as string[], req.user);
      // return res.apiv3({ shortBodiesMap });
      return res.apiv3();
    }
    catch (err) {
      logger.error('Error occurred while fetching shortBodiesMap.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while fetching shortBodiesMap.'));
    }
  });

  return router;
};
