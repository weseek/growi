// disable no-return-await for model functions
/* eslint-disable no-return-await */

module.exports = function(crowi) {
  const debug = require('debug')('growi:models:bookmark');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;
  const bookmarkEvent = crowi.event('bookmark');

  let bookmarkSchema = null;


  bookmarkSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    user: { type: ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now() },
  });
  bookmarkSchema.index({ page: 1, user: 1 }, { unique: true });

  bookmarkSchema.statics.countByPageId = async function(pageId) {
    return await this.count({ page: pageId });
  };

  bookmarkSchema.statics.populatePage = async function(bookmarks) {
    const Bookmark = this;
    const User = crowi.model('User');

    return Bookmark.populate(bookmarks, [
      { path: 'page' },
      { path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS },
    ]);
  };

  // bookmark チェック用
  bookmarkSchema.statics.findByPageIdAndUserId = function(pageId, userId) {
    const Bookmark = this;

    return new Promise(((resolve, reject) => {
      return Bookmark.findOne({ page: pageId, user: userId }, (err, doc) => {
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
    const Bookmark = this;
    const requestUser = option.requestUser || null;

    debug('Finding bookmark with requesting user:', requestUser);

    const limit = option.limit || 50;
    const offset = option.offset || 0;
    const populatePage = option.populatePage || false;

    return new Promise(((resolve, reject) => {
      Bookmark
        .find({ user: user._id })
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
    const Bookmark = this;

    const newBookmark = new Bookmark({ page, user, createdAt: Date.now() });

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
      debug('Bookmark.save failed', err);
      throw err;
    }
  };

  /**
   * Remove bookmark
   * used only when removing the page
   * @param {string} pageId
   */
  bookmarkSchema.statics.removeBookmarksByPageId = async function(pageId) {
    const Bookmark = this;

    try {
      const data = await Bookmark.remove({ page: pageId });
      bookmarkEvent.emit('delete', pageId);
      return data;
    }
    catch (err) {
      debug('Bookmark.remove failed (removeBookmarkByPage)', err);
      throw err;
    }
  };

  bookmarkSchema.statics.removeBookmark = async function(page, user) {
    const Bookmark = this;

    try {
      const data = await Bookmark.findOneAndRemove({ page, user });
      bookmarkEvent.emit('delete', page);
      return data;
    }
    catch (err) {
      debug('Bookmark.findOneAndRemove failed', err);
      throw err;
    }
  };

  return mongoose.model('Bookmark', bookmarkSchema);
};
