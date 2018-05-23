module.exports = function(crowi) {
  var debug = require('debug')('growi:models:comment')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , USER_PUBLIC_FIELDS = '_id image isGravatarEnabled googleId name username email status createdAt' // TODO: どこか別の場所へ...
    , commentSchema
  ;

  commentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    creator: { type: ObjectId, ref: 'User', index: true  },
    revision: { type: ObjectId, ref: 'Revision', index: true },
    comment: { type: String, required: true },
    commentPosition: { type: Number, default: -1 },
    createdAt: { type: Date, default: Date.now },
    isMarkdown: { type: Boolean, default: false}
  });

  commentSchema.statics.create = function(pageId, creatorId, revisionId, comment, position, isMarkdown) {
    var Comment = this,
      commentPosition = position || -1;


    return new Promise(function(resolve, reject) {
      var newComment = new Comment();

      newComment.page = pageId;
      newComment.creator = creatorId;
      newComment.revision = revisionId;
      newComment.comment = comment;
      newComment.commentPosition = position;
      newComment.isMarkdown = isMarkdown || false;

      newComment.save(function(err, data) {
        if (err) {
          debug('Error on saving comment.', err);
          return reject(err);
        }
        debug('Comment saved.', data);
        return resolve(data);
      });
    });
  };

  commentSchema.statics.getCommentsByPageId = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
      self
        .find({page: id})
        .sort({'createdAt': -1})
        .populate('creator', USER_PUBLIC_FIELDS)
        .exec(function(err, data) {
          if (err) {
            return reject(err);
          }

          if (data.length < 1) {
            return resolve([]);
          }

          //debug('Comment loaded', data);
          return resolve(data);
        });
    });
  };

  commentSchema.statics.getCommentsByRevisionId = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
      self
        .find({revision: id})
        .sort({'createdAt': -1})
        .populate('creator', USER_PUBLIC_FIELDS)
        .exec(function(err, data) {
          if (err) {
            return reject(err);
          }

          if (data.length < 1) {
            return resolve([]);
          }

          debug('Comment loaded', data);
          return resolve(data);
        });
    });
  };

  commentSchema.statics.countCommentByPageId = function(page) {
    var self = this;

    return new Promise(function(resolve, reject) {
      self.count({page: page}, function(err, data) {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  commentSchema.statics.removeCommentsByPageId = function(pageId) {
    var Comment = this;

    return new Promise(function(resolve, reject) {
      Comment.remove({page: pageId}, function(err, done) {
        if (err) {
          return reject(err);
        }

        resolve(done);
      });
    });
  };

  /**
   * post save hook
   */
  commentSchema.post('save', function(savedComment) {
    var Page = crowi.model('Page')
      , Comment = crowi.model('Comment')
    ;

    Page.updateCommentCount(savedComment.page)
    .then(function(page) {
      debug('CommentCount Updated', page);
    }).catch(function() {
    });
  });

  return mongoose.model('Comment', commentSchema);
};
