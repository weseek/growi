import { ErrorV3 } from '@growi/core';
import { body } from 'express-validator';

import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { InvalidParentBookmarkFolderError } from '~/server/models/errors';
import loggerFactory from '~/utils/logger';

import BookmarkFolder from '../../models/bookmark-folder';

const logger = loggerFactory('growi:routes:apiv3:bookmark-folder');

const express = require('express');

const router = express.Router();

const validator = {
  bookmarkFolder: [
    body('name').isString().withMessage('name must be a string'),
    body('parent').isMongoId().optional({ nullable: true }),
  ],
  bookmarkPage: [
    body('pageId').isMongoId().withMessage('Page ID must be a valid mongo ID'),
    body('folderId').optional({ nullable: true }).isMongoId().withMessage('Folder ID must be a valid mongo ID'),
  ],
};

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  // Create new bookmark folder
  router.post('/', accessTokenParser, loginRequiredStrictly, validator.bookmarkFolder, apiV3FormValidator, async(req, res) => {
    const owner = req.user?._id;
    const { name, parent } = req.body;
    const params = {
      name, owner, parent,
    };

    try {
      const bookmarkFolder = await BookmarkFolder.createByParameters(params);
      logger.debug('bookmark folder created', bookmarkFolder);
      return res.apiv3({ bookmarkFolder });
    }
    catch (err) {
      if (err instanceof InvalidParentBookmarkFolderError) {
        return res.apiv3Err(new ErrorV3(err.message, 'failed_to_create_bookmark_folder'));
      }
      return res.apiv3Err(err, 500);
    }
  });

  // List bookmark folders and child
  router.get('/list/:parentId?', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const { parentId } = req.params;
    const _parentId = parentId ?? null;
    try {
      const bookmarkFolders = await BookmarkFolder.findFolderAndChildren(req.user?._id, _parentId);
      const bookmarkFolderItems = bookmarkFolders.map(bookmarkFolder => ({
        _id: bookmarkFolder._id,
        name: bookmarkFolder.name,
        parent: bookmarkFolder.parent,
        children: bookmarkFolder.children,
        bookmarks: bookmarkFolder.bookmarks,
      }));
      return res.apiv3({ bookmarkFolderItems });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  // Delete bookmark folder and children
  router.delete('/:id', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const { id } = req.params;
    try {
      const result = await BookmarkFolder.deleteFolderAndChildren(id);
      const { deletedCount } = result;
      return res.apiv3({ deletedCount });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/', accessTokenParser, loginRequiredStrictly, validator.bookmarkFolder, async(req, res) => {
    const { bookmarkFolderId, name, parent } = req.body;
    try {
      const bookmarkFolder = await BookmarkFolder.updateBookmarkFolder(bookmarkFolderId, name, parent);
      return res.apiv3({ bookmarkFolder });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  router.post('/add-boookmark-to-folder', accessTokenParser, loginRequiredStrictly, validator.bookmarkPage, apiV3FormValidator, async(req, res) => {
    const userId = req.user?._id;
    const { pageId, folderId } = req.body;

    try {
      const bookmarkFolder = await BookmarkFolder.insertOrUpdateBookmarkedPage(pageId, userId, folderId);
      logger.debug('bookmark added to folder', bookmarkFolder);
      return res.apiv3({ bookmarkFolder });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
