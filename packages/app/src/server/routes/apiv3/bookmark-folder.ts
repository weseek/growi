import { ErrorV3 } from '@growi/core';
import { body } from 'express-validator';

import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import loggerFactory from '~/utils/logger';

import BookmarkFolder, { InvalidParentBookmarkFolder } from '../../models/bookmark-folder';

const logger = loggerFactory('growi:routes:apiv3:bookmark-folder');

const express = require('express');

const router = express.Router();

const validator = {
  bookmarkFolder: [
    body('name').isString().withMessage('name must be a string'),
    body('parent').optional({ nullable: true }),
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
      if (err instanceof InvalidParentBookmarkFolder) {
        return res.apiv3Err(new ErrorV3(err.message, 'failed_to_create_bookmark_folder'));
      }
      return res.apiv3Err(err, 500);
    }
  });

  // List all main bookmark folders
  router.get('/list', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    try {
      const bookmarkFolders = await BookmarkFolder.findParentFolderByUserId(req.user?._id);
      const bookmarkFolderItems = await Promise.all(bookmarkFolders.map(async bookmarkFolder => ({
        bookmarkFolder,
        childCount: await BookmarkFolder.countDocuments({ parent: bookmarkFolder._id }),
      })));
      return res.apiv3({ bookmarkFolderItems });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  router.get('/list-child/:parentId', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const { parentId } = req.params;
    try {
      const bookmarkFolders = await BookmarkFolder.findChildFolderById(parentId);
      return res.apiv3({ bookmarkFolders });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  // Delete bookmark folder and children
  router.delete('/', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const { boookmarkFolderId } = req.body;
    try {
      await BookmarkFolder.deleteFolderAndChildren(boookmarkFolderId);
      return res.apiv3();
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
  return router;
};
