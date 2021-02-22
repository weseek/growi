import { Schema, Types, Model } from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import { getOrCreateModel } from '../util/mongoose-utils';
import loggerFactory from '~/utils/logger';
import { IUser, USER_PUBLIC_FIELDS } from '~/server/models/user';
import BookmarkEvent from '~/server/events/bookmark';

const ObjectId = Schema.Types.ObjectId;

const logger = loggerFactory('growi:models:bookmark');
export interface IBookmark {
  _id: Types.ObjectId;
  page: Types.ObjectId;
  user: IUser;
  createdAt: Date;
}

type Option= {
  limit:number,
  offset: number,
  requestUser: IUser,
  populatePage: boolean,
}

const schema = new Schema({
  page: { type: ObjectId, ref: 'Page', index: true },
  user: { type: ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now },
});
schema.index({ page: 1, user: 1 }, { unique: true });
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

class Bookmark extends Model {

  static bookmarkEvent: any;

  constructor() {
    super();
    this.bookmarkEvent = new BookmarkEvent();
  }

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

  static async populatePage(bookmarks) {
    return this.populate(bookmarks, {
      path: 'page',
      populate: {
        path: 'lastUpdateUser', model: 'User', select: USER_PUBLIC_FIELDS,
      },
    });
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

  static async findByUser(user:IUser, option:Option) {
    const requestUser = option.requestUser || null;

    logger.debug('Finding bookmark with requesting user:', requestUser);

    const limit = option.limit || 50;
    const offset = option.offset || 0;
    const populatePage = option.populatePage || false;

    return new Promise(((resolve, reject) => {
      this.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec((err, bookmarks) => {
          if (err) {
            return reject(err);
          }

          if (!populatePage) {
            return resolve(bookmarks);
          }

          return this.populatePage(bookmarks).then(resolve);
        });
    }));
  }

  static async add(page, user) {

    try {
      const bookmark = await this.create({ page, user });
      this.bookmarkEvent.emit('create', page._id);
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
      // bookmarkEvent.emit('delete', pageId);
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
      // bookmarkEvent.emit('delete', pageId);
      return data;
    }
    catch (err) {
      logger.debug('Bookmark.findOneAndRemove failed', err);
      throw err;
    }
  }

}

schema.loadClass(Bookmark);
export default getOrCreateModel<IBookmark>('Bookmark', schema);
