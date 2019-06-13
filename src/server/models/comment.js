// disable no-return-await for model functions
/* eslint-disable no-return-await */

module.exports = function(crowi) {
  const debug = require('debug')('growi:models:comment');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const commentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    creator: { type: ObjectId, ref: 'User', index: true },
    revision: { type: ObjectId, ref: 'Revision', index: true },
    comment: { type: String, required: true },
    commentPosition: { type: Number, default: -1 },
    createdAt: { type: Date, default: Date.now },
    isMarkdown: { type: Boolean, default: false },
    replyTo: { type: ObjectId },
  });

  commentSchema.statics.create = function(pageId, creatorId, revisionId, comment, position, isMarkdown, replyTo) {
    const Comment = this;

    return new Promise(((resolve, reject) => {
      const newComment = new Comment();

      newComment.page = pageId;
      newComment.creator = creatorId;
      newComment.revision = revisionId;
      newComment.comment = comment;
      newComment.commentPosition = position;
      newComment.isMarkdown = isMarkdown || false;
      newComment.replyTo = replyTo;

      newComment.save((err, data) => {
        if (err) {
          debug('Error on saving comment.', err);
          return reject(err);
        }
        debug('Comment saved.', data);
        return resolve(data);
      });
    }));
  };

  commentSchema.statics.getCommentsByPageId = function(id) {
    return this.find({ page: id }).sort({ createdAt: -1 });
  };

  commentSchema.statics.getCommentsByRevisionId = function(id) {
    return this.find({ revision: id }).sort({ createdAt: -1 });
  };

  commentSchema.statics.countCommentByPageId = function(page) {
    const self = this;

    return new Promise(((resolve, reject) => {
      self.count({ page }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  };

  commentSchema.statics.removeCommentsByPageId = function(pageId) {
    const Comment = this;

    return new Promise(((resolve, reject) => {
      Comment.remove({ page: pageId }, (err, done) => {
        if (err) {
          return reject(err);
        }

        resolve(done);
      });
    }));
  };

  commentSchema.methods.removeWithReplies = async function() {
    const Comment = crowi.model('Comment');
    return Comment.remove({
      $or: (
        [{ replyTo: this._id }, { _id: this._id }]),
    });
  };

  /**
   * post save hook
   */
  commentSchema.post('save', (savedComment) => {
    const Page = crowi.model('Page');

    Page.updateCommentCount(savedComment.page)
      .then((page) => {
        debug('CommentCount Updated', page);
      })
      .catch(() => {
      });
  });

  return mongoose.model('Comment', commentSchema);
};
