import loggerFactory from '~/utils/logger';

// disable no-return-await for model functions
/* eslint-disable no-return-await */

module.exports = function(crowi) {
  // eslint-disable-next-line no-unused-vars
  const logger = loggerFactory('growi:models:revision');

  const mongoose = require('mongoose');
  const mongoosePaginate = require('mongoose-paginate-v2');

  const ObjectId = mongoose.Schema.Types.ObjectId;
  const revisionSchema = new mongoose.Schema({
    // OBSOLETE path: { type: String, required: true, index: true }
    pageId: { type: ObjectId, required: true, index: true },
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

  revisionSchema.statics.updateRevisionListByPath = async function(path, updateData) {
    const Revision = this;

    return Revision.updateMany({ path }, { $set: updateData });
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

  return mongoose.model('Revision', revisionSchema);
};
