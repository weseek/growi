const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tokenGtoP: { type: String, required: true, unique: true },
  tokenPtoG: { type: String, required: true, unique: true },
});
class SlackAppIntegration {

  static generateAccessToken(user) {
    const hasher1 = crypto.createHash('sha512');
    const hasher2 = crypto.createHash('sha512');
    const growi = hasher1.update(new Date().getTime() + user._id);
    const proxy = hasher2.update(new Date().getTime() + user.username);
    return [growi.digest('base64'), proxy.digest('base64')];
  }

}

module.exports = function(crowi) {
  SlackAppIntegration.crowi = crowi;
  schema.loadClass(SlackAppIntegration);
  return mongoose.model('SlackAppIntegration', schema);
};
