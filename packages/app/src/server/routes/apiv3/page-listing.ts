import express, { Request, Router } from 'express';
import { pagePathUtils } from '@growi/core';
import { query, oneOf } from 'express-validator';

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
  pageIdAndPathRequired: [
    query('id').isMongoId().withMessage('id is required'),
    query('path').isString().withMessage('path is required'),
  ],
  pageIdOrPathRequired: oneOf([
    query('id').isMongoId(),
    query('path').isString(),
  ], 'id or path is required'),
};

/*
 * Routes
 */
export default (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  // Do not use loginRequired with isGuestAllowed true since page tree may show private page titles
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const router = express.Router();


  // eslint-disable-next-line max-len
  router.get('/siblings', accessTokenParser, loginRequiredStrictly, ...validator.pageIdAndPathRequired, apiV3FormValidator, async(req: AuthorizedRequest, res: ApiV3Response): Promise<any> => {
    const { id, path } = req.query;

    const Page: PageModel = crowi.model('Page');

    let siblings: PageDocument[];
    let target: PageDocument;
    try {
      siblings = await Page.findSiblingsByPathAndViewer(path as string, req.user);

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

    return res.apiv3({ target, siblings });
  });

  /*
   * In most cases, using path should be prioritized
   */
  // eslint-disable-next-line max-len
  router.get('/ancestors', accessTokenParser, loginRequiredStrictly, validator.pageIdOrPathRequired, apiV3FormValidator, async(req: AuthorizedRequest, res: ApiV3Response): Promise<any> => {
    const { id, path } = req.query;

    const Page: PageModel = crowi.model('Page');

    let ancestors: PageDocument[];
    try {
      ancestors = await Page.findAncestorsByPathOrId((path || id) as string);

      if (ancestors.length === 0 && !isTopPage(path as string)) {
        throw Error('Ancestors must have at least one page.');
      }
    }
    catch (err) {
      logger.error('Error occurred while finding pages.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while finding pages.'));
    }

    return res.apiv3({ ancestors });
  });

  /*
   * In most cases, using id should be prioritized
   */
  // eslint-disable-next-line max-len
  router.get('/children', accessTokenParser, loginRequiredStrictly, validator.pageIdOrPathRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { id, path } = req.query;

    const Page: PageModel = crowi.model('Page');

    try {
      const pages = await Page.findChildrenByParentPathOrIdAndViewer((id || path)as string, req.user);
      return res.apiv3({ pages });
    }
    catch (err) {
      logger.error('Error occurred while finding children.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while finding children.'));
    }
  });

  return router;
};
