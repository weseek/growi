import express, {
  NextFunction, Request, RequestHandler, Router,
} from 'express';
import { body, query, param } from 'express-validator';
import { IPage } from '../../../interfaces/page';

import ErrorV3 from '../../models/vo/error-apiv3';
import loggerFactory from '../../../utils/logger';
import Crowi from '../../crowi';
import { ApiV3Response } from './apiv3-response';
import { isTopPage } from '^/../core/dist/cjs/utils/page-path-utils';

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

    const Page = crowi.model('Page');

    let siblings: IPage[];
    let ancestors: IPage[];
    try {
      siblings = await Page.findSiblingsByPathAndViewer(path, req.user);
      ancestors = await Page.findAncestorsByPath(path);
    }
    catch (err) {
      logger.error('Error occurred while finding pages.', err);
      return res.apiv3Err(new ErrorV3('Error occurred while finding pages.'));
    }
    const target = siblings.filter(page => page._id.toString() === id)?.[0];

    if (target == null) {
      throw Error('Target must exist.');
    }

    if (isTopPage(path as string)) {
      siblings = siblings.filter(page => !isTopPage(page.path));
    }

    return res.apiv3({ target, ancestors, pages: siblings });
  });

  return router;
};
