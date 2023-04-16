import crypto from 'crypto';

import { defaultSupportedSlackEventActions } from '@growi/slack';
import mongoose from 'mongoose';


const schema = new mongoose.Schema({
  tokenGtoP: { type: String, required: true, unique: true },
  tokenPtoG: { type: String, required: true, unique: true },
  isPrimary: { type: Boolean, unique: true, sparse: true },
  permissionsForBroadcastUseCommands: Map,
  permissionsForSingleUseCommands: Map,
  permissionsForSlackEventActions: {
    type: Map,
    default: new Map(defaultSupportedSlackEventActions.map(action => [action, false])),
  },
});

class SlackAppIntegration {

  crowi;

  static generateAccessTokens(saltForGtoP, saltForPtoG) {
    const now = new Date().getTime();
    const hasher1 = crypto.createHash('sha512');
    const hasher2 = crypto.createHash('sha512');
    const tokenGtoP = hasher1.update(`gtop-${saltForGtoP}-${now.toString()}`).digest('base64');
    const tokenPtoG = hasher2.update(`ptog-${saltForPtoG}-${now.toString()}`).digest('base64');
    return [tokenGtoP, tokenPtoG];
  }

  static async generateUniqueAccessTokens() {
    let duplicateTokens;
    let tokenGtoP;
    let tokenPtoG;
    let generateTokens;

    // get salt strings
    const saltForGtoP = this.crowi.configManager.getConfig('crowi', 'slackbot:withProxy:saltForGtoP');
    const saltForPtoG = this.crowi.configManager.getConfig('crowi', 'slackbot:withProxy:saltForPtoG');

    do {
      generateTokens = this.generateAccessTokens(saltForGtoP, saltForPtoG);
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
