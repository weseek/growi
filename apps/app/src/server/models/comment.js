module.exports = function(crowi) {
  const debug = require('debug')('growi:models:comment');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;
  const commentEvent = crowi.event('comment');

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

  commentSchema.statics.create = async function(pageId, creatorId, revisionId, comment, position, isMarkdown, replyTo) {
    const Comment = this;

    try {
      const newComment = new Comment();

      newComment.page = pageId;
      newComment.creator = creatorId;
      newComment.revision = revisionId;
      newComment.comment = comment;
      newComment.commentPosition = position;
      newComment.isMarkdown = isMarkdown || false;
      newComment.replyTo = replyTo;

      const savedComment = await newComment.save();
      debug('Comment saved.', savedComment);
      return savedComment;
    }
    catch (err) {
      debug('Error on saving comment.', err);
      throw err;
    }
  };

  commentSchema.statics.getCommentsByPageId = function(id) {
    return this.find({ page: id }).sort({ createdAt: -1 });
  };

  commentSchema.statics.getCommentsByRevisionId = function(id) {
    return this.find({ revision: id }).sort({ createdAt: -1 });
  };


  /**
   * @return {object} key: page._id, value: comments
   */
  commentSchema.statics.getPageIdToCommentMap = async function(pageIds) {
    const results = await this.aggregate()
      .match({ page: { $in: pageIds } })
      .group({ _id: '$page', comments: { $push: '$comment' } });

    // convert to map
    const idToCommentMap = {};
    results.forEach((result, i) => {
      idToCommentMap[result._id] = result.comments;
    });

    return idToCommentMap;
  };

  commentSchema.statics.countCommentByPageId = async function(page) {
    const self = this;

    try {
      const count = await self.countDocuments({ page });
      return count;
    }
    catch (err) {
      throw err;
    }
  };

  commentSchema.statics.updateCommentsByPageId = async function(comment, isMarkdown, commentId) {
    const Comment = this;

    const commentData = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $set: { comment, isMarkdown } },
    );

    await commentEvent.emit('update', commentData);

    return commentData;
  };


  /**
   * post remove hook
   */
  commentSchema.post('reomove', async(savedComment) => {
    await commentEvent.emit('delete', savedComment);
  });

  commentSchema.methods.removeWithReplies = async function(comment) {
    const Comment = crowi.model('Comment');

    await Comment.deleteMany({
      $or: (
        [{ replyTo: this._id }, { _id: this._id }]),
    });

    await commentEvent.emit('delete', comment);
    return;
  };

  commentSchema.statics.findCreatorsByPage = async function(page) {
    return this.distinct('creator', { page }).exec();
  };

  return mongoose.model('Comment', commentSchema);
};
