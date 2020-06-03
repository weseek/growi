// disable no-return-await for model functions
/* eslint-disable no-return-await */

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * define schema
 */
const schema = new mongoose.Schema({
  relatedPage: {
    type: ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  expiration: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
});

schema.plugin(uniqueValidator);

/**
 * shareLink Class
 *
 * @class ShareLink
 */
class ShareLink {

  static async getRelatedPageByLinkId(id) {
    const shareLink = await this.find({ _id: id }).populate('relatedPage');
    const { relatedPage } = shareLink;
    return relatedPage;
  }

}

module.exports = function(crowi) {
  ShareLink.crowi = crowi;
  schema.loadClass(ShareLink);
  const model = mongoose.model('ShareLink', schema);
  return model;
};
