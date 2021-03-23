
const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;
  const { boltService } = crowi;
  const requestHandler = boltService.receiver.requestHandler.bind(boltService.receiver);


  function accessTokenParserForSlackBot(req, res, next) {
    const slackBotAccessToken = req.body.slack_bot_access_token || null;
    if (slackBotAccessToken == null) {
      next();
    }

    if (slackBotAccessToken === crowi.configManager.getConfig('crowi', 'slackbot:access-token')) {
      req.body.user = {
        username: 'slackBot',
      };
    }
    next();
  }

  router.post('/', accessTokenParserForSlackBot, async(req, res) => {
    // for verification request URL on Event Subscriptions
    if (req.body.type === 'url_verification') {
      res.send(req.body);
      return;
    }

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    await requestHandler(req.body);
  });

  return router;
};
