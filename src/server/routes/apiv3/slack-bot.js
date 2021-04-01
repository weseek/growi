
const express = require('express');

const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:slack-bot');

const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;

  // Check if the access token is correct
  // function verificationAccessToken(req, res, next) {
  //   const slackBotAccessToken = req.body.slack_bot_access_token || null;

  //   if (slackBotAccessToken == null || slackBotAccessToken !== this.crowi.configManager.getConfig('crowi', 'slackbot:access-token')) {
  //     logger.error('slack_bot_access_token is invalid.');
  //     return res.send('*Access token is inValid*');
  //   }

  //   return next();
  // }

  function verificationRequestUrl(req, res, next) {
    // for verification request URL on Event Subscriptions
    if (req.body.type === 'url_verification') {
      return res.send(req.body);
    }

    return next();
  }

  router.post('/', verificationRequestUrl, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();
    console.log(req.body);

    const { text } = req.body;
    const args = text.split(' ');
    const command = args[0];

    switch (command) {
      case 'search':
        await crowi.boltService.searchService.search(req.body, args);
        break;

      default:
        this.notCommand(command);
        break;
    }


  });

  return router;
};
