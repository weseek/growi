module.exports = function(crowi) {
  const mongoose = require('mongoose');

  const slackbotAccessTokenSchema = new mongoose.Schema({
    accessTokenForGrowi: { type: String, required: true, unique: true },
    accessTokenForProxy: { type: String, required: true, unique: true },
  });

  return mongoose.model('SlackbotAccessToken', slackbotAccessTokenSchema);
};
