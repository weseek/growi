const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * define schema
 */
const passwordResetOrderSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  relatedUser: { type: ObjectId, ref: 'User' },
});
passwordResetOrderSchema.plugin(uniqueValidator);

/**
 * PasswordResetOrder Class
 *
 * @class PasswordResetOrder
 */

module.exports = function(crowi) {

  passwordResetOrderSchema.statics.generateOneTimeToken = function() {
    // TODO: generate unique token by GW-6802
  };

  passwordResetOrderSchema.methods.isExpired = function() {
    const now = Date.now();
    const expiredAt = this.createdAt.getTime() + 600000;

    return expiredAt < now;
  };

  return mongoose.model('PasswordResetOrder', passwordResetOrderSchema);
};
