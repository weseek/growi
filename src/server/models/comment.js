// disable no-return-await for model functions
/* eslint-disable no-return-await */
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:models:comment');

module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const commentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    creator: { type: ObjectId, ref: 'User', index: true },
    revision: { type: ObjectId, ref: 'Revision', index: true },
    comment: { type: String, required: true },
    commentPosition: { type: Number, default: -1 },
    isMarkdown: { type: Boolean, default: false },
    replyTo: { type: ObjectId },
  }, {
    timestamps: true,
  });

  commentSchema.statics.create = function(pageId, creatorId, revisionId, comment, position, isMarkdown, replyTo) {
    return new Promise(((resolve, reject) => {
      const newComment = new this();

      newComment.page = pageId;
      newComment.creator = creatorId;
      newComment.revision = revisionId;
      newComment.comment = comment;
      newComment.commentPosition = position;
      newComment.isMarkdown = isMarkdown || false;
      newComment.replyTo = replyTo;

      newComment.save((err, data) => {
        if (err) {
          logger.debug('Error on saving comment.', err);
          return reject(err);
        }
        logger.debug('Comment saved.', data);
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
    return new Promise(((resolve, reject) => {
      this.count({ page }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  };

  commentSchema.statics.updateCommentsByPageId = function(comment, isMarkdown, commentId) {
    return this.findOneAndUpdate(
      { _id: commentId },
      { $set: { comment, isMarkdown } },
    );

  };

  commentSchema.statics.removeCommentsByPageId = function(pageId) {
    return new Promise(((resolve, reject) => {
      this.remove({ page: pageId }, (err, done) => {
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
        logger.debug('CommentCount Updated', page);
      })
      .catch((err) => {
        logger.debug('Page.updateCommentCount failed', err);
      });
  });

  return mongoose.model('Comment', commentSchema);
};
