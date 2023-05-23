import { ErrorV3 } from '@growi/core';
import { body } from 'express-validator';
import { Types } from 'mongoose';

import { BookmarkFolderItems, BookmarkedPage } from '~/interfaces/bookmark-info';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { InvalidParentBookmarkFolderError } from '~/server/models/errors';
import { serializePageSecurely } from '~/server/models/serializers/page-serializer';
import loggerFactory from '~/utils/logger';

import BookmarkFolder from '../../models/bookmark-folder';

const logger = loggerFactory('growi:routes:apiv3:bookmark-folder');
const express = require('express');

const router = express.Router();

const validator = {
  bookmarkFolder: [
    body('name').isString().withMessage('name must be a string'),
    body('parent').isMongoId().optional({ nullable: true })
      .custom(async(parent: string) => {
        const parentFolder = await BookmarkFolder.findById(parent);
        if (parentFolder == null || parentFolder.parent != null) {
          throw new Error('Maximum folder hierarchy of 2 levels');
        }
      }),
  ],
  bookmarkPage: [
    body('pageId').isMongoId().withMessage('Page ID must be a valid mongo ID'),
    body('folderId').optional({ nullable: true }).isMongoId().withMessage('Folder ID must be a valid mongo ID'),
  ],
  bookmark: [
    body('pageId').isMongoId().withMessage('Page ID must be a valid mongo ID'),
    body('status').isBoolean().withMessage('status must be one of true or false'),
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
      logger.error(err);
      if (err instanceof InvalidParentBookmarkFolderError) {
        return res.apiv3Err(new ErrorV3(err.message, 'failed_to_create_bookmark_folder'));
      }
      return res.apiv3Err(err, 500);
    }
  });

  // List bookmark folders and child
  router.get('/list/:userId', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const { userId } = req.params;

    const getBookmarkFolders = async(
        userId: Types.ObjectId | string,
        parentFolderId?: Types.ObjectId | string,
    ) => {
      const Page = crowi.model('Page');

      const folders = await BookmarkFolder.find({ owner: userId, parent: parentFolderId })
        .populate('children')
        .populate({
          path: 'bookmarks',
          model: 'Bookmark',
          populate: {
            path: 'page',
            model: 'Page',
            populate: {
              path: 'lastUpdateUser',
              model: 'User',
            },
          },
        });

      const returnValue: BookmarkFolderItems[] = [];

      // serialize page
      folders.forEach((folder: BookmarkFolderItems) => {
        folder.bookmarks.forEach((bookmark: BookmarkedPage) => {
          if (bookmark.page != null && bookmark.page instanceof Page) {
            const lastUpdateUser = bookmark.page.lastUpdateUser;

            bookmark.page = serializePageSecurely(bookmark.page);

            bookmark.page.lastUpdateUser = lastUpdateUser;
          }
        });
      });

      const promises = folders.map(async(folder: BookmarkFolderItems) => {
        const children = await getBookmarkFolders(userId, folder._id);

        const res = {
          _id: folder._id.toString(),
          name: folder.name,
          owner: folder.owner,
          bookmarks: folder.bookmarks,
          children,
          parent: folder.parent,
        };
        return res;
      });

      const results = await Promise.all(promises) as unknown as BookmarkFolderItems[];
      returnValue.push(...results);
      return returnValue;
    };

    try {
      const bookmarkFolderItems = await getBookmarkFolders(userId, undefined);

      return res.apiv3({ bookmarkFolderItems });
    }
    catch (err) {
      logger.error(err);
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
      logger.error(err);
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
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/update-bookmark', accessTokenParser, loginRequiredStrictly, validator.bookmark, async(req, res) => {
    const { pageId, status } = req.body;
    const userId = req.user?._id;
    try {
      const bookmarkFolder = await BookmarkFolder.updateBookmark(pageId, status, userId);
      return res.apiv3({ bookmarkFolder });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });
  return router;
};
