import loggerFactory from '~/utils/logger';

// disable no-return-await for model functions
/* eslint-disable no-return-await */

module.exports = function(crowi) {
  // eslint-disable-next-line no-unused-vars
  const logger = loggerFactory('growi:models:revision');

  const mongoose = require('mongoose');
  const mongoosePaginate = require('mongoose-paginate-v2');

  // allow empty strings
  mongoose.Schema.Types.String.checkRequired(v => v != null);

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
    bodyLength: { type: Number },
    format: { type: String, default: 'markdown' },
    author: { type: ObjectId, ref: 'User' },
    hasDiffToPrev: { type: Boolean },
  }, {
    timestamps: { createdAt: true, updatedAt: false },
  });
  revisionSchema.plugin(mongoosePaginate);

  revisionSchema.statics.updateRevisionListByPageId = async function(pageId, updateData) {
    return this.updateMany({ pageId }, { $set: updateData });
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
    newRevision.pageId = pageData._id;
    newRevision.body = body;
    newRevision.bodyLength = body.length;
    newRevision.format = format;
    newRevision.author = user._id;
    if (pageData.revision != null) {
      newRevision.hasDiffToPrev = body !== previousBody;
    }

    return newRevision;
  };

  revisionSchema.methods.shouldSSR = function() {
    if (this.bodyLength == null) {
      return true;
    }

    const ssrMaxRevisionBodyLength = crowi.configManager.getConfig('crowi', 'app:ssrMaxRevisionBodyLength');
    return ssrMaxRevisionBodyLength >= this.bodyLength;
  };

  return mongoose.model('Revision', revisionSchema);
};
