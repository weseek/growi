import type { IUser } from '@growi/core/dist/interfaces';
import {
  Types, Document, Model, Schema,
} from 'mongoose';

import { IComment } from '~/interfaces/comment';
import { getOrCreateModel } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:models:comment');

export interface CommentDocument extends IComment, Document {
  removeWithReplies: () => Promise<void>
  findCreatorsByPage: (pageId: Types.ObjectId) => Promise<CommentDocument[]>
}

export interface CommentModel extends Model<CommentDocument> {
  add: (
    pageId: Types.ObjectId,
    creatorId: Types.ObjectId,
    revisionId: Types.ObjectId,
    comment: string,
    commentPosition: number,
    replyTo?: Types.ObjectId | null,
  ) => Promise<void>

  getCommentsByPageId: (pageId: Types.ObjectId) => Promise<CommentDocument[]>

  getCommentsByRevisionId: (revisionId: Types.ObjectId) => Promise<CommentDocument[]>

  getPageIdToCommentMap: (pageIds: Types.ObjectId[]) => Promise<Record<string, CommentDocument[]>>

  findCreatorsByPage: (pageId: Types.ObjectId) => Promise<IUser[]>

  countCommentByPageId: (pageId: Types.ObjectId) => Promise<number>
}

const commentSchema = new Schema<CommentDocument, CommentModel>({
  page: { type: Schema.Types.ObjectId, ref: 'Page', index: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  revision: { type: Schema.Types.ObjectId, ref: 'Revision', index: true },
  comment: { type: String, required: true },
  commentPosition: { type: Number, default: -1 },
  replyTo: { type: Schema.Types.ObjectId },
}, {
  timestamps: true,
});

/**
 * post remove hook
 */
commentSchema.post('remove', async(savedComment) => {
  await commentEvent.emit('delete', savedComment);
});


commentSchema.statics.add = async function(
    pageId: Types.ObjectId,
    creatorId: Types.ObjectId,
    revisionId: Types.ObjectId,
    comment: string,
    commentPosition: number,
    replyTo?: string,
) {

  try {
    const data = await this.create({
      page: pageId.toString(),
      creator: creatorId.toString(),
      revision: revisionId.toString(),
      comment,
      commentPosition,
      replyTo,
    });
    logger.debug('Comment saved.', data);
  }
  catch (err) {
    logger.debug('Error on saving comment.', err);
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

commentSchema.statics.findCreatorsByPage = async function(page) {
  return this.distinct('creator', { page }).exec();
};

commentSchema.statics.countCommentByPageId = async function(page) {
  return this.count({ page });
};

commentSchema.methods.removeWithReplies = async function(comment) {
  await this.remove({
    $or: (
      [{ replyTo: this._id }, { _id: this._id }]),
  });

  await commentEvent.emit('delete', comment);
  return;
};

export default getOrCreateModel<CommentDocument, CommentModel>('Comment', commentSchema);
