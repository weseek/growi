module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:bookmark')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , bookmarkSchema;


  bookmarkSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    user: { type: ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now() }
  });
  bookmarkSchema.index({page: 1, user: 1}, {unique: true});

  bookmarkSchema.statics.populatePage = function(bookmarks) {
    var Bookmark = this;
    var User = crowi.model('User');
    var Page = crowi.model('Page');

    return new Promise(function(resolve, reject) {
      Bookmark.populate(bookmarks, {path: 'page'}, function(err, bookmarks) {
        if (err) {
          return reject(err);
        }

        Bookmark.populate(bookmarks, {path: 'page.revision', model: 'Revision'}, function(err, bookmarks) {
          if (err) {
            return reject(err);
          }

          Bookmark.populate(bookmarks, {path: 'page.revision.author', model: 'User', select: User.USER_PUBLIC_FIELDS}, function(err, bookmarks) {
            if (err) {
              return reject(err);
            }

            return resolve(bookmarks);
          });
        });
      });
    });
  };

  // bookmark チェック用
  bookmarkSchema.statics.findByPageIdAndUserId = function(pageId, userId) {
    var Bookmark = this;

    return new Promise(function(resolve, reject) {
      return Bookmark.findOne({ page: pageId, user: userId }, function(err, doc) {
        if (err) {
          return reject(err);
        }

        return resolve(doc);
      });
    });
  };

  bookmarkSchema.statics.findByUser = function(user, option) {
    var User = crowi.model('User');
    var Bookmark = this;

    var limit = option.limit || 50;
    var offset = option.offset || 0;
    var populatePage = option.populatePage || false;

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

          return Bookmark.populatePage(bookmarks).then(resolve).catch(reject);
        });
    });
  };

  bookmarkSchema.statics.add = function(page, user) {
    var Bookmark = this;

    return new Promise(function(resolve, reject) {
      var newBookmark = new Bookmark;

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

  bookmarkSchema.statics.remove = function(page, user) {
    var Bookmark = this;

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
