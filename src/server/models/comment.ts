
import { Schema, Model } from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';
import { Comment as IComment } from '~/interfaces/page';

/*
 * define methods type
 */
interface ModelMethods {
  removeWithReplies(): void
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

  removeWithReplies() {
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
