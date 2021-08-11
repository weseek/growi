const crypto = require('crypto');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tokenGtoP: { type: String, required: true, unique: true },
  tokenPtoG: { type: String, required: true, unique: true },
  supportedCommandsForBroadcastUse: { type: [String], default: [] },
  supportedCommandsForSingleUse: { type: [String], default: [] },
});

class SlackAppIntegration {

  static generateAccessTokens() {
    const now = new Date().getTime();
    const hasher1 = crypto.createHash('sha512');
    const hasher2 = crypto.createHash('sha512');
    const tokenGtoP = hasher1.update(`gtop${now.toString()}${process.env.SALT_FOR_GTOP_TOKEN}`).digest('base64');
    const tokenPtoG = hasher2.update(`ptog${now.toString()}${process.env.SALT_FOR_PTOG_TOKEN}`).digest('base64');
    return [tokenGtoP, tokenPtoG];
  }

  static async generateUniqueAccessTokens() {
    let duplicateTokens;
    let tokenGtoP;
    let tokenPtoG;
    let generateTokens;

    do {
      generateTokens = this.generateAccessTokens();
      tokenGtoP = generateTokens[0];
      tokenPtoG = generateTokens[1];
      // eslint-disable-next-line no-await-in-loop
      duplicateTokens = await this.findOne({ $or: [{ tokenGtoP }, { tokenPtoG }] });
    } while (duplicateTokens != null);


    return { tokenGtoP, tokenPtoG };
  }

}

module.exports = function(crowi) {
  SlackAppIntegration.crowi = crowi;
  schema.loadClass(SlackAppIntegration);
  return mongoose.model('SlackAppIntegration', schema);
};
