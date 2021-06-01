const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tokenGtoP: { type: String, required: true, unique: true },
  tokenPtoG: { type: String, required: true, unique: true },
});
class SlackAppIntegration {

  static generateAccessToken() {
    const hasher1 = crypto.createHash('sha512');
    const hasher2 = crypto.createHash('sha512');
    const tokenGtoP = hasher1.update(new Date().getTime().toString() + process.env.SALT_FOR_GTOP_TOKEN);
    const tokenPtoG = hasher2.update(new Date().getTime().toString() + process.env.SALT_FOR_PTOG_TOKEN);
    return [tokenGtoP.digest('base64'), tokenPtoG.digest('base64')];
  }

  static generateUniqueAccessTokens = async() => {
    let checkTokens;
    let tokenGtoP;
    let tokenPtoG;
    let generateTokens;

    do {
      generateTokens = this.generateAccessToken();
      tokenGtoP = generateTokens[0];
      tokenPtoG = generateTokens[1];
      // eslint-disable-next-line no-await-in-loop
      checkTokens = await SlackAppIntegration.findOne({ $or: [{ tokenGtoP }, { tokenPtoG }] });
    } while (checkTokens != null);

    return { tokenGtoP, tokenPtoG };
  }

}

module.exports = function(crowi) {
  SlackAppIntegration.crowi = crowi;
  schema.loadClass(SlackAppIntegration);
  return mongoose.model('SlackAppIntegration', schema);
};
