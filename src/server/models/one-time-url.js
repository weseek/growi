const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * define schema
 */
const schema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: String,
  relatedUser: { type: ObjectId, ref: 'User' },
  isExpired: Boolean,
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

/**
 * OneTimeUrl Class
 *
 * @class OneTimeUrl
 */
class OneTimeUrl {

  static generateOneTimeToken() {
    // TODO: generate unique token by GW-6802
  }

}

module.exports = function(crowi) {
  OneTimeUrl.crowi = crowi;
  schema.loadClass(OneTimeUrl);
  const model = mongoose.model('OneTimeUrl', schema);
  return model;
};
