const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  relatedUser: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, required: true },
  expiredAt: { type: Date, default: Date.now + 600000, required: true },
});
schema.plugin(uniqueValidator);

class PasswordResetOrder {

  static generateOneTimeToken() {
    const now = new Date().getTime();
    const hasher1 = crypto.createHash('sha512');
    const token = hasher1.update(`gtop${now.toString()}${process.env.SALT_FOR_GTOP_TOKEN}`).digest('base64');
    return token;
  }

  static async generateUniqueAccessToken() {
    let duplicateToken;
    let generateToken;

    do {
      generateToken = this.generateOneTimeToken();
      // eslint-disable-next-line no-await-in-loop
      duplicateToken = await this.findOne({ $or: { token: generateToken } });
    } while (duplicateToken != null);

    return generateToken;
  }

  static isExpired() {
    return this.expiredAt.getTime() < new Date().getTime();
  }

}

module.exports = function(crowi) {
  PasswordResetOrder.crowi = crowi;
  schema.loadClass(PasswordResetOrder);
  const model = mongoose.model('PasswordResetOrder', schema);
  return model;
};
