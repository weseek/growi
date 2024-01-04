import type { IUser, IComment, IInlineComment } from '@growi/core/dist/interfaces';
import {
  Document, Schema,
  type Types, type Model, type Query,
} from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:models:comment');

// export interface CommentDocument extends IComment, Document {
export interface CommentDocument extends IInlineComment, Document {
  removeWithReplies: () => Promise<void>
  findCreatorsByPage: (pageId: Types.ObjectId) => Promise<CommentDocument[]>
}


type FindCommentsByPageId = (pageId: Types.ObjectId) => Query<CommentDocument[], CommentDocument>;
type FindCommentsByRevisionId = (revisionId: Types.ObjectId) => Query<CommentDocument[], CommentDocument>;
type FindCreatorsByPage = (pageId: Types.ObjectId) => Promise<IUser[]>
type GetPageIdToCommentMap = (pageIds: Types.ObjectId[]) => Promise<Record<string, CommentDocument[]>>
type CountCommentByPageId = (pageId: Types.ObjectId) => Promise<number>

export interface CommentModel<D extends CommentDocument = CommentDocument> extends Model<D> {
  findCommentsByPageId: FindCommentsByPageId
  findCommentsByRevisionId: FindCommentsByRevisionId
  findCreatorsByPage: FindCreatorsByPage
  getPageIdToCommentMap: GetPageIdToCommentMap
  countCommentByPageId: CountCommentByPageId
}

const commentSchema = new Schema<CommentDocument, CommentModel>({
  page: { type: Schema.Types.ObjectId, ref: 'Page', index: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  revision: { type: Schema.Types.ObjectId, ref: 'Revision', index: true },
  comment: { type: String, required: true },
  replyTo: { type: Schema.Types.ObjectId },
  inline: { type: Schema.Types.Boolean, index: true },
  firstLevelBlockXpath: Schema.Types.String,
  innerHtmlDiff: Schema.Types.String,
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Schema.Types.Date,
}, {
  timestamps: true,
});

commentSchema.statics.findCommentsByPageId = function(id) {
  return this.find({ page: id }).sort({ createdAt: -1 });
};

commentSchema.statics.findCommentsByRevisionId = function(id) {
  return this.find({ revision: id }).sort({ createdAt: -1 });
};

commentSchema.statics.findCreatorsByPage = async function(page) {
  return this.distinct('creator', { page }).exec();
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
  return this.count({ page });
};

commentSchema.methods.removeWithReplies = async function(comment) {
  await this.remove({
    $or: (
      [{ replyTo: this._id }, { _id: this._id }]),
  });
};

export const Comment = getOrCreateModel<CommentDocument, CommentModel>('Comment', commentSchema);
