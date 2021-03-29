
const express = require('express');

const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:slack-bot');

const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;
  const requestHandler = boltService.receiver.requestHandler.bind(boltService.receiver);


  // Check if the access token is correct
  function verificationAccessToken(req, res, next) {
    const slackBotAccessToken = req.body.slack_bot_access_token || null;

    if (slackBotAccessToken == null || slackBotAccessToken !== this.crowi.configManager.getConfig('crowi', 'slackbot:access-token')) {
      logger.error('slack_bot_access_token is invalid.');
      return res.send('*Access token is inValid*');
    }

    return next();
  }

  function verificationRequestUrl(req, res, next) {
    // for verification request URL on Event Subscriptions
    if (req.body.type === 'url_verification') {
      return res.send(req.body);
    }

    return next();
  }

  router.post('/', verificationRequestUrl, verificationAccessToken, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    await requestHandler(req.body);
  });

  return router;
};
