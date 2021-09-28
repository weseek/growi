import { getModelSafely } from '~/server/util/mongoose-utils';

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
    isMarkdown: { type: Boolean, default: false },
    replyTo: { type: ObjectId },
  }, {
    timestamps: true,
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

  commentSchema.statics.updateCommentsByPageId = async function(comment, isMarkdown, commentId) {
    const Comment = this;
    const commentEvent = crowi.event('comment');

    const commentData = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $set: { comment, isMarkdown } },
    );

    await commentEvent.emit('update', commentData.creator);

    return commentData;
  };


  /**
   * post remove hook
   */
  commentSchema.post('reomove', async(savedComment) => {
    const Page = crowi.model('Page');
    const commentEvent = crowi.event('comment');

    try {
      // TODO: move Page.updateCommentCount to commentService by GW7532
      const page = await Page.updateCommentCount(savedComment.page);
      debug('CommentCount Updated', page);
    }
    catch (err) {
      throw err;
    }

    await commentEvent.emit('remove', savedComment);
  });

  commentSchema.methods.removeWithReplies = async function(comment) {
    const Comment = crowi.model('Comment');
    const commentEvent = crowi.event('comment');

    await Comment.remove({
      $or: (
        [{ replyTo: this._id }, { _id: this._id }]),
    });

    await commentEvent.emit('remove', comment);
    return;
  };

  commentSchema.statics.findCreatorsByPage = async function(page) {
    return this.distinct('creator', { page }).exec();
  };

  /**
   * post save hook
   */
  commentSchema.post('save', async(savedComment) => {
    const Page = crowi.model('Page');
    const commentEvent = crowi.event('comment');
    await commentEvent.emit('create', savedComment.creator);

    try {
      // TODO: move Page.updateCommentCount to commentService by GW7532
      const page = await Page.updateCommentCount(savedComment.page);
      debug('CommentCount Updated', page);
    }
    catch (err) {
      throw err;
    }

    try {
      const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
      const activityLog = await Activity.createByPageComment(savedComment);
      debug('Activity created', activityLog);
    }
    catch (err) {
      throw err;
    }
    await commentEvent.emit('create', savedComment);
  });

  return mongoose.model('Comment', commentSchema);
};
