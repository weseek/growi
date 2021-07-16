const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  relatedUser: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, required: true },
  expiredAt: { type: Date },
});
schema.plugin(uniqueValidator);

class PasswordResetOrder {

  static generateOneTimeToken() {
    // TODO: generate unique token by GW-6802
  }

  static isExpired() {
    const now = Date.now();
    const expiredAt = this.createdAt.getTime() + 600000;

    return expiredAt < now;
  }

}

module.exports = function(crowi) {
  PasswordResetOrder.crowi = crowi;
  schema.loadClass(PasswordResetOrder);
  const model = mongoose.model('PasswordResetOrder', schema);
  return model;
};
