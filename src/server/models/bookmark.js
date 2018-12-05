module.exports = function(crowi) {
  const debug = require('debug')('growi:models:bookmark');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  let bookmarkSchema = null;


  bookmarkSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    user: { type: ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now() }
  });
  bookmarkSchema.index({page: 1, user: 1}, {unique: true});

  bookmarkSchema.statics.countByPageId = async function(pageId) {
    return await this.count({ page: pageId });
  };

  bookmarkSchema.statics.populatePage = async function(bookmarks) {
    const Bookmark = this;
    const User = crowi.model('User');

    return Bookmark.populate(bookmarks, [
      {path: 'page'},
      {path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS},
    ]);
  };

  // bookmark チェック用
  bookmarkSchema.statics.findByPageIdAndUserId = function(pageId, userId) {
    const Bookmark = this;

    return new Promise(function(resolve, reject) {
      return Bookmark.findOne({ page: pageId, user: userId }, function(err, doc) {
        if (err) {
          return reject(err);
        }

        return resolve(doc);
      });
    });
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

    return new Promise(function(resolve, reject) {
      Bookmark
        .find({ user: user._id })
        .sort({createdAt: -1})
        .skip(offset)
        .limit(limit)
        .exec(function(err, bookmarks) {
          if (err) {
            return reject(err);
          }

          if (!populatePage) {
            return resolve(bookmarks);
          }

          return Bookmark.populatePage(bookmarks, requestUser).then(resolve);
        });
    });
  };

  bookmarkSchema.statics.add = function(page, user) {
    const Bookmark = this;

    return new Promise(function(resolve, reject) {
      const newBookmark = new Bookmark;

      newBookmark.page = page;
      newBookmark.user = user;
      newBookmark.createdAt = Date.now();
      newBookmark.save(function(err, bookmark) {
        debug('Bookmark.save', err, bookmark);
        if (err) {
          if (err.code === 11000) { // duplicate key (dummy reesponse of new object)
            return resolve(newBookmark);
          }
          return reject(err);
        }

        resolve(bookmark);
      });
    });
  };

  /**
   * Remove bookmark
   * used only when removing the page
   * @param {string} pageId
   */
  bookmarkSchema.statics.removeBookmarksByPageId = function(pageId) {
    const Bookmark = this;

    return new Promise(function(resolve, reject) {
      Bookmark.remove({page: pageId}, function(err, data) {
        if (err) {
          debug('Bookmark.remove failed (removeBookmarkByPage)', err);
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  bookmarkSchema.statics.removeBookmark = function(page, user) {
    const Bookmark = this;

    return new Promise(function(resolve, reject) {
      Bookmark.findOneAndRemove({page: page, user: user}, function(err, data) {
        if (err) {
          debug('Bookmark.findOneAndRemove failed', err);
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  return mongoose.model('Bookmark', bookmarkSchema);
};
