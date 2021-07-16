const mongoose = require('mongoose');
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
schema.plugin(uniqueValidator);

/**
 * PasswordResetOrder Class
 *
 * @class PasswordResetOrder
 */
class PasswordResetOrder {

  static generateOneTimeToken() {
    // TODO: generate unique token by GW-6802
  }

}

module.exports = function(crowi) {
  PasswordResetOrder.crowi = crowi;
  schema.loadClass(PasswordResetOrder);
  const model = mongoose.model('PasswordResetOrder', schema);
  return model;
};
