import { Schema, Model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { getOrCreateModel } from '../util/mongoose-utils';
import { Revision as IRevision } from '../../interfaces/page';

// import User from '~/server/models/user';

/*
 * define methods type
 */
interface ModelMethods {
  updateName(name:string): Promise<void>;
}

const schema = new Schema<IRevision>({

  path: { type: String, required: true, index: true },
  body: {
    type: String,
    required: true,
    get: (data) => {
      // replace CR/CRLF to LF above v3.1.5
      // see https://github.com/weseek/growi/issues/463
      return data ? data.replace(/\r\n?/g, '\n') : '';
    },
  },
  format: { type: String, default: 'markdown' },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  hasDiffToPrev: { type: Boolean },
});

schema.plugin(mongoosePaginate);

/**
 * Revision Class
 *
 * @class Revision
 */
class Revision extends Model {

  /*
   * preparation for https://github.com/weseek/growi/issues/216
   */
  // // create a XSS Filter instance
  // // TODO read options
  // this.xss = new Xss(true);
  // // prevent XSS when pre save
  // revisionSchema.pre('save', function(next) {
  //   this.body = xss.process(this.body);
  //   next();
  // });

  static findRevisions(ids) {

    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('The argument was not Array.'));
    }

    // return new Promise(((resolve, reject) => {
    //   this.find({ _id: { $in: ids } })
    //     .sort({ createdAt: -1 })
    //     .populate('author', User.USER_PUBLIC_FIELDS)
    //     .exec((err, revisions) => {
    //       if (err) {
    //         return reject(err);
    //       }

    //       return resolve(revisions);
    //     });
    // }));
  }

  static findRevisionIdList(path) {
    return this.find({ path })
      .select('_id author createdAt hasDiffToPrev')
      .sort({ createdAt: -1 })
      .exec();
  }

  static findRevisionList(path, options) {

    // return new Promise(((resolve, reject) => {
    //   this.find({ path })
    //     .sort({ createdAt: -1 })
    //     .populate('author', User.USER_PUBLIC_FIELDS)
    //     .exec((err, data) => {
    //       if (err) {
    //         return reject(err);
    //       }

    //       return resolve(data);
    //     });
    // }));
  }

  static updateRevisionListByPath(path, updateData, options) {
    return new Promise(((resolve, reject) => {
      this.update({ path }, { $set: updateData }, { multi: true }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  }

  static prepareRevision(pageData, body, previousBody, user, options) {
    if (!options) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }
    const format = options.format || 'markdown';

    if (!user._id) {
      throw new Error('Error: user should have _id');
    }

    const newRevision = new this();
    newRevision.path = pageData.path;
    newRevision.body = body;
    newRevision.format = format;
    newRevision.author = user._id;
    newRevision.createdAt = Date.now();
    if (pageData.revision != null) {
      newRevision.hasDiffToPrev = body !== previousBody;
    }

    return newRevision;
  }

  static removeRevisionsByPath(path) {
    return this.remove({ path });
  }

}

schema.loadClass(Revision);
export default getOrCreateModel<IRevision, ModelMethods>('Revision', schema);
