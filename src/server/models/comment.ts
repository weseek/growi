
import { Schema, Model } from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';
import { Comment as IComment } from '~/interfaces/page';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:models:comment');

/*
 * define methods type
 */
interface ModelMethods {
  getIdToNameMap(tagIds:Schema.Types.ObjectId[]): {[key:string]:string}
}

const schema = new Schema<IComment>({
  page: { type:  Schema.Types.ObjectId, ref: 'Page', index: true },
  creator: { type:  Schema.Types.ObjectId, ref: 'User', index: true },
  revision: { type:  Schema.Types.ObjectId, ref: 'Revision', index: true },
  comment: { type: String, required: true },
  commentPosition: { type: Number, default: -1 },
  isMarkdown: { type: Boolean, default: false },
  replyTo: { type:  Schema.Types.ObjectId },
}, {
  timestamps: true,
});

/**
 * Tag Class
 *
 * @class Comment
 */
class Comment extends Model {

  static create(pageId, creatorId, revisionId, comment, position, isMarkdown, replyTo) {
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
  }

  static getCommentsByPageId(id) {
    return this.find({ page: id }).sort({ createdAt: -1 });
  }

  static getCommentsByRevisionId(id) {
    return this.find({ revision: id }).sort({ createdAt: -1 });
  }

  static countCommentByPageId(page) {
    return this.count({ page });
  }

  static updateCommentsByPageId(comment, isMarkdown, commentId) {
    return this.findOneAndUpdate(
      { _id: commentId },
      { $set: { comment, isMarkdown } },
    );

  }

  async removeWithReplies() {
    return this.remove({
      $or: (
        [{ replyTo: this._id }, { _id: this._id }]),
    });
  }

}

/**
 * post save hook
 */
// schema.post('save', (savedComment) => {
//   const Page = crowi.model('Page');

//   Page.updateCommentCount(savedComment.page)
//     .then((page) => {
//       logger.debug('CommentCount Updated', page);
//     })
//     .catch((err) => {
//       logger.debug('Page.updateCommentCount failed', err);
//     });
// });


schema.loadClass(Comment);
export default getOrCreateModel<IComment, ModelMethods>('Comment', schema);
