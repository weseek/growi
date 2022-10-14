import express, { Request } from 'express';
import { body } from 'express-validator';

import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import loggerFactory from '~/utils/logger';

import Crowi from '../../crowi';
import BookmarkFolder from '../../models/bookmark-folder';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:bookmark-folder');

const validator = {
  bookmarkFolder: [
    body('name').isString().withMessage('name must be a string'),
    body('owner').isMongoId().withMessage('owner must be a mongo ID'),
    body('parent').optional().isMongoId().withMessage('parent must be a mongo ID'),
  ],
};

module.exports = (crowi: Crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const router = express.Router();
  router.post('/', accessTokenParser, loginRequiredStrictly, validator.bookmarkFolder, apiV3FormValidator, async(req: Request, res: ApiV3Response) => {
    const data = {
      name: req.body.name,
      owner: req.body.owner,
      parent: req.body.parent,
    };

    try {
      const bookmarkFolder = await BookmarkFolder.createByParameters(data);
      logger.debug('bookmark folder created', bookmarkFolder);
      return res.apiv3({ bookmarkFolder });
    }
    catch (err) {
      logger.error('create bookmark folder failed', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
