import { ErrorV3 } from '@growi/core';
import { scanAllTemplateStatus } from '@growi/pluginkit/dist/server/utils/v4';
import express from 'express';

import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

const logger = loggerFactory('growi:routes:apiv3:templates');

const router = express.Router();

// const validator = {
//   bookmarkFolder: [
//     body('name').isString().withMessage('name must be a string'),
//     body('parent').isMongoId().optional({ nullable: true })
//       .custom(async(parent: string) => {
//         const parentFolder = await BookmarkFolder.findById(parent);
//         if (parentFolder == null || parentFolder.parent != null) {
//           throw new Error('Maximum folder hierarchy of 2 levels');
//         }
//       }),
//     body('children').optional().isArray().withMessage('Children must be an array'),
//     body('bookmarkFolderId').optional().isMongoId().withMessage('Bookark Folder ID must be a valid mongo ID'),
//   ],
//   bookmarkPage: [
//     body('pageId').isMongoId().withMessage('Page ID must be a valid mongo ID'),
//     body('folderId').optional({ nullable: true }).isMongoId().withMessage('Folder ID must be a valid mongo ID'),
//   ],
//   bookmark: [
//     body('pageId').isMongoId().withMessage('Page ID must be a valid mongo ID'),
//     body('status').isBoolean().withMessage('status must be one of true or false'),
//   ],
// };

module.exports = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  router.get('/', loginRequiredStrictly, apiV3FormValidator, async(req, res: ApiV3Response) => {
    // const owner = req.user?._id;
    // const { name, parent } = req.body;
    // const params = {
    //   name, owner, parent,
    // };

    // try {
    //   const bookmarkFolder = await BookmarkFolder.createByParameters(params);
    //   logger.debug('bookmark folder created', bookmarkFolder);
    //   return res.apiv3({ bookmarkFolder });
    // }
    // catch (err) {
    //   logger.error(err);
    //   if (err instanceof InvalidParentBookmarkFolderError) {
    //     return res.apiv3Err(new ErrorV3(err.message, 'failed_to_create_bookmark_folder'));
    //   }
    //   return res.apiv3Err(err, 500);
    // }

    const presetTemplatesRoot = resolveFromRoot('../../node_modules/@growi/preset-templates');
    const status = await scanAllTemplateStatus(presetTemplatesRoot);

    return res.apiv3({ status });
  });

  return router;
};
