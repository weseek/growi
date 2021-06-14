import { Schema, Model } from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import { getOrCreateModel } from '../util/mongoose-utils';
import loggerFactory from '~/utils/logger';
// import { USER_PUBLIC_FIELDS } from '~/server/models/new-user';
// import BookmarkEvent from '~/server/events/bookmark';
import { Bookmark as IBookmark } from '~/interfaces/page';
import { User as IUser } from '~/interfaces/user';

const ObjectId = Schema.Types.ObjectId;

const logger = loggerFactory('growi:models:bookmark');

type Option= {
  limit:number,
  offset: number,
  requestUser: IUser,
  populatePage: boolean,
}

/*
 * define methods type
 */
interface ModelMethods {
  removeBookmark(pageId:string, user:IUser): Promise<IBookmark>
 }

const schema = new Schema<IBookmark>({
  page: { type: ObjectId, ref: 'Page', index: true },
  user: { type: ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now },
});
schema.index({ page: 1, user: 1 }, { unique: true });
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

class Bookmark extends Model {

  static countByPageId(pageId) {
    return this.count({ page: pageId });
  }

  /**
   * @return {object} key: page._id, value: bookmark count
   */
  static async getPageIdToCountMap(pageIds) {
    const results = await this.aggregate()
      .match({ page: { $in: pageIds } })
      .group({ _id: '$page', count: { $sum: 1 } });

    // convert to map
    const idToCountMap = {};
    results.forEach((result) => {
      idToCountMap[result._id] = result.count;
    });

    return idToCountMap;
  }

  // bookmark チェック用
  static async findByPageIdAndUserId(pageId, userId) {
    return new Promise(((resolve, reject) => {
      return this.findOne({ page: pageId, user: userId }, (err, doc) => {
        if (err) {
          return reject(err);
        }

        return resolve(doc);
      });
    }));
  }

  static async add(page, user) {

    try {
      const bookmark = await this.create({ page, user });
      // BookmarkEvent.emit('create', page._id);
      return bookmark;
    }
    catch (err) {
      logger.debug('Bookmark.save failed', err);
      throw err;
    }
  }

  /**
   * Remove bookmark
   * used only when removing the page
   * @param {string} pageId
   */
  static async removeBookmarksByPageId(pageId) {
    try {
      const data = await this.remove({ page: pageId });
      // this.bookmarkEvent.emit('delete', pageId);
      return data;
    }
    catch (err) {
      logger.debug('Bookmark.remove failed (removeBookmarkByPage)', err);
      throw err;
    }
  }

  static async removeBookmark(pageId, user) {
    try {
      const data = await this.findOneAndRemove({ page: pageId, user });
      // BookmarkEvent.emit('delete', pageId);
      return data;
    }
    catch (err) {
      logger.debug('Bookmark.findOneAndRemove failed', err);
      throw err;
    }
  }

}

schema.loadClass(Bookmark);
export default getOrCreateModel<IBookmark, ModelMethods>('Bookmark', schema);
