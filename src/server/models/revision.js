// disable no-return-await for model functions
/* eslint-disable no-return-await */

module.exports = function(crowi) {
  // eslint-disable-next-line no-unused-vars
  const logger = require('@alias/logger')('growi:models:revision');

  const mongoose = require('mongoose');

  const ObjectId = mongoose.Schema.Types.ObjectId;
  const revisionSchema = new mongoose.Schema({
    path: { type: String, required: true },
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
    const Revision = this;


    const User = crowi.model('User');

    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('The argument was not Array.'));
    }

    return new Promise(((resolve, reject) => {
      Revision
        .find({ _id: { $in: ids } })
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
    const Revision = this;


    const User = crowi.model('User');

    return new Promise(((resolve, reject) => {
      Revision.find({ path })
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
    const Revision = this;

    return new Promise(((resolve, reject) => {
      Revision.update({ path }, { $set: updateData }, { multi: true }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  };

  revisionSchema.statics.prepareRevision = function(pageData, body, previousBody, user, options) {
    const Revision = this;

    if (!options) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }
    const format = options.format || 'markdown';

    if (!user._id) {
      throw new Error('Error: user should have _id');
    }

    const newRevision = new Revision();
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
    const Revision = this;

    return new Promise(((resolve, reject) => {
      Revision.remove({ path }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    }));
  };

  return mongoose.model('Revision', revisionSchema);
};
