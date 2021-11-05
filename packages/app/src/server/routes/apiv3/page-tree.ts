import express, {
  Request, Router,
} from 'express';
import { pagePathUtils } from '@growi/core';
import { query } from 'express-validator';

import { PageDocument, PageModel } from '../../models/page';
import ErrorV3 from '../../models/vo/error-apiv3';
import loggerFactory from '../../../utils/logger';
import Crowi from '../../crowi';
import { ApiV3Response } from './interfaces/apiv3-response';

const { isTopPage } = pagePathUtils;

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
  getPagesAroundTarget: [
    query('id').isMongoId().withMessage('id is required'),
    query('path').isString().withMessage('path is required'),
  ],
  getChildPagesByParentId: [
    query('id').isMongoId().withMessage('id is required'),
  ],
};

/*
 * Routes
 */
export default (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  // Do not use loginRequired with isGuestAllowed true since page tree may show private pages' title
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const router = express.Router();


  // eslint-disable-next-line max-len
  router.get('/pages', accessTokenParser, loginRequiredStrictly, ...validator.getPagesAroundTarget, async(req: AuthorizedRequest, res: ApiV3Response): Promise<any> => {
    const { id, path } = req.query;

    const Page: PageModel = crowi.model('Page');

    let siblings: PageDocument[];
    let ancestors: PageDocument[];
    let target: PageDocument;
    try {
      siblings = await Page.findSiblingsByPathAndViewer(path as string, req.user);
      ancestors = await Page.findAncestorsByPath(path as string);

      target = siblings.filter(page => page._id.toString() === id)?.[0];
      if (target == null) {
        throw Error('Target must exist.');
      }
    }
    catch (err) {
      logger.error('Error occurred while finding pages.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while finding pages.'));
    }

    if (isTopPage(path as string)) {
      siblings = siblings.filter(page => !isTopPage(page.path));
    }

    return res.apiv3({ target, ancestors, pages: siblings });
  });

  // eslint-disable-next-line max-len
  router.get('/child-pages', accessTokenParser, loginRequiredStrictly, ...validator.getChildPagesByParentId, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { id } = req.query;

    const Page: PageModel = crowi.model('Page');

    try {
      const pages = await Page.findChildrenByParentIdAndViewer(id as string, req.user);
      return res.apiv3({ pages });
    }
    catch (err) {
      logger.error('Error occurred while finding children.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while finding children.'));
    }
  });

  return router;
};
