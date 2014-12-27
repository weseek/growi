module.exports = function(app, models) {
  var mongoose = require('mongoose')
    , debug = require('debug')('crowi:models:bookmark')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , bookmarkSchema;


  bookmarkSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    user: { type: ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now() }
  });

  // bookmark チェック用
  bookmarkSchema.statics.findByPageIdAndUser = function(pageId, user, callback) {
    var Bookmark = this;

    Bookmark.findOne({ page: pageId, user: user._id }, callback);
  };

  bookmarkSchema.statics.findByUser = function(user, option, callback) {
    var Bookmark = this;

    var limit = option.limit || 50;
    var offset = option.skip || 0;

    Bookmark
      .find({ user: user._id })
      //.sort('createdAt', -1)
      .skip(offset)
      .limit(limit)
      .exec(function(err, bookmarks) {
        debug ('bookmarks', bookmarks);
        callback(err, bookmarks);
      });
  };

  bookmarkSchema.statics.add = function(page, user, callback) {
    var Bookmark = this;

    Bookmark.findOneAndUpdate(
      { page: page._id, user: user._id },
      { page: page._id, user: user._id, createdAt: Date.now() },
      { upsert: true, },
      function (err, bookmark) {
        debug('Bookmark.findOneAndUpdate', err, bookmark);
        callback(err, bookmark);
    });
  };

  bookmarkSchema.statics.remove = function(page, user, callback) {
    // To be implemented ...
  };

  models.Bookmark = mongoose.model('Bookmark', bookmarkSchema);

  return models.Bookmark;
};
