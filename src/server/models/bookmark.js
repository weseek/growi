/* eslint-disable no-return-await */

import loggerFactory from '~/utils/logger';

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

const logger = loggerFactory('growi:models:bookmark');

module.exports = function(crowi) {
  const bookmarkEvent = crowi.event('bookmark');

  let bookmarkSchema = null;


  bookmarkSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    user: { type: ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now },
  });
  bookmarkSchema.index({ page: 1, user: 1 }, { unique: true });
  bookmarkSchema.plugin(uniqueValidator);

  bookmarkSchema.statics.countByPageId = async function(pageId) {
    return await this.count({ page: pageId });
  };

  /**
   * @return {object} key: page._id, value: bookmark count
   */
  bookmarkSchema.statics.getPageIdToCountMap = async function(pageIds) {
    const results = await this.aggregate()
      .match({ page: { $in: pageIds } })
      .group({ _id: '$page', count: { $sum: 1 } });

    // convert to map
    const idToCountMap = {};
    results.forEach((result) => {
      idToCountMap[result._id] = result.count;
    });

    return idToCountMap;
  };

  bookmarkSchema.statics.populatePage = async function(bookmarks) {
    const User = crowi.model('User');

    return this.populate(bookmarks, {
      path: 'page',
      populate: {
        path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS,
      },
    });
  };

  // bookmark チェック用
  bookmarkSchema.statics.findByPageIdAndUserId = function(pageId, userId) {
    return new Promise(((resolve, reject) => {
      return this.findOne({ page: pageId, user: userId }, (err, doc) => {
        if (err) {
          return reject(err);
        }

        return resolve(doc);
      });
    }));
  };

  /**
   * option = {
   *  limit: Int
   *  offset: Int
   *  requestUser: User
   * }
   */
  bookmarkSchema.statics.findByUser = function(user, option) {
    const requestUser = option.requestUser || null;

    logger.debug('Finding bookmark with requesting user:', requestUser);

    const limit = option.limit || 50;
    const offset = option.offset || 0;
    const populatePage = option.populatePage || false;

    return new Promise(((resolve, reject) => {
      this.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec((err, bookmarks) => {
          if (err) {
            return reject(err);
          }

          if (!populatePage) {
            return resolve(bookmarks);
          }

          return Bookmark.populatePage(bookmarks, requestUser).then(resolve);
        });
    }));
  };

  bookmarkSchema.statics.add = async function(page, user) {
    const newBookmark = new this({ page, user, createdAt: Date.now() });

    try {
      const bookmark = await newBookmark.save();
      bookmarkEvent.emit('create', page._id);
      return bookmark;
    }
    catch (err) {
      if (err.code === 11000) {
        // duplicate key (dummy response of new object)
        return newBookmark;
      }
      logger.debug('Bookmark.save failed', err);
      throw err;
    }
  };

  /**
   * Remove bookmark
   * used only when removing the page
   * @param {string} pageId
   */
  bookmarkSchema.statics.removeBookmarksByPageId = async function(pageId) {
    try {
      const data = await this.remove({ page: pageId });
      bookmarkEvent.emit('delete', pageId);
      return data;
    }
    catch (err) {
      logger.debug('Bookmark.remove failed (removeBookmarkByPage)', err);
      throw err;
    }
  };

  bookmarkSchema.statics.removeBookmark = async function(pageId, user) {
    try {
      const data = await this.findOneAndRemove({ page: pageId, user });
      bookmarkEvent.emit('delete', pageId);
      return data;
    }
    catch (err) {
      logger.debug('Bookmark.findOneAndRemove failed', err);
      throw err;
    }
  };

  return mongoose.model('Bookmark', bookmarkSchema);
};
