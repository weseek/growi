const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  relatedUser: { type: ObjectId, ref: 'User' },
  processed: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  expiredAt: { type: Date, default: Date.now() + 600000, required: true },
});
schema.plugin(uniqueValidator);

class PasswordResetOrder {

  static generateOneTimeToken() {
    const buf = crypto.randomBytes(256);
    const token = buf.toString('hex');

    return token;
  }

  static async createPasswordResetOrder(email) {
    let token;
    let duplicateToken;

    do {
      token = this.generateOneTimeToken();
      // eslint-disable-next-line no-await-in-loop
      duplicateToken = await this.findOne({ token });
    } while (duplicateToken != null);

    const passwordResetOrderData = await this.create({ token, email });

    return passwordResetOrderData;
  }

  isExpired() {
    return this.expiredAt.getTime() < Date.now();
  }

}

module.exports = function(crowi) {
  PasswordResetOrder.crowi = crowi;
  schema.loadClass(PasswordResetOrder);
  const model = mongoose.model('PasswordResetOrder', schema);
  return model;
};
