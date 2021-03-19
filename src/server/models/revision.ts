// disable no-return-await for model functions
/* eslint-disable no-return-await */
import loggerFactory from '~/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:models:revision');

module.exports = function(crowi) {


  const mongoose = require('mongoose');
  const mongoosePaginate = require('mongoose-paginate-v2');

  const ObjectId = mongoose.Schema.Types.ObjectId;
  const revisionSchema = new mongoose.Schema({
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
    author: { type: ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    hasDiffToPrev: { type: Boolean },
  });
  revisionSchema.plugin(mongoosePaginate);

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

  revisionSchema.statics.findRevisions = function(ids) {
    const User = crowi.model('User');

    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('The argument was not Array.'));
    }

    return new Promise(((resolve, reject) => {
      this.find({ _id: { $in: ids } })
        .sort({ createdAt: -1 })
        .populate('author', User.USER_PUBLIC_FIELDS)
        .exec((err, revisions) => {
          if (err) {
            return reject(err);
          }

          return resolve(revisions);
        });
    }));
  };

  revisionSchema.statics.findRevisionIdList = function(path) {
    return this.find({ path })
      .select('_id author createdAt hasDiffToPrev')
      .sort({ createdAt: -1 })
      .exec();
  };

  revisionSchema.statics.findRevisionList = function(path, options) {
    const User = crowi.model('User');

    return new Promise(((resolve, reject) => {
      this.find({ path })
        .sort({ createdAt: -1 })
        .populate('author', User.USER_PUBLIC_FIELDS)
        .exec((err, data) => {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
    }));
  };

  revisionSchema.statics.updateRevisionListByPath = function(path, updateData, options) {
    return new Promise(((resolve, reject) => {
      this.update({ path }, { $set: updateData }, { multi: true }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  };

  revisionSchema.statics.prepareRevision = function(pageData, body, previousBody, user, options) {
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
  };

  revisionSchema.statics.removeRevisionsByPath = function(path) {
    return new Promise(((resolve, reject) => {
      this.remove({ path }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  };

  return mongoose.model('Revision', revisionSchema);
};
