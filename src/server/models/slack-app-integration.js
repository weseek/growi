module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const crypto = require('crypto');

  const slackAppIntegrationSchema = new mongoose.Schema({
    tokenGtoP: { type: String, required: true, unique: true },
    tokenPtoG: { type: String, required: true, unique: true },
  });

  return mongoose.model('SlackAppIntegration', slackAppIntegrationSchema);
};
