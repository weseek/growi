
const express = require('express');

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

    const { body } = req;
    const args = body.text.split(' ');
    const command = args[0];

    switch (command) {
      case 'search':
        await crowi.slackService.showEphemeralSearchResults(body, args);
        break;
      case 'create':
        await crowi.slackService.createModal(body);
        break;
      default:
        await crowi.slackService.notCommand(body);
        break;
    }

  });

  const handleBlockActions = async(payload) => {
    const { action_id: actionId } = payload.actions[0];

    switch (actionId) {
      case 'shareSearchResults': {
        await crowi.slackService.shareSearchResults(payload);
        break;
      }
      case 'showNextResults': {
        const parsedValue = JSON.parse(payload.actions[0].value);

        const { body, args, offset } = parsedValue;
        const newOffset = offset + 10;
        await crowi.slackService.showEphemeralSearchResults(body, args, newOffset);
        break;
      }
      default:
        break;
    }
  };

  const handleViewSubmission = async(payload) => {
    const { callback_id: callbackId } = payload.view;

    switch (callbackId) {
      case 'createPage':
        await crowi.slackService.createPageInGrowi(payload);
        break;
      default:
        break;
    }
  };

  router.post('/interactive', verificationRequestUrl, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    switch (type) {
      case 'block_actions':
        await handleBlockActions(payload);
        break;
      case 'view_submission':
        await handleViewSubmission(payload);
        break;
      default:
        break;
    }

  });


  return router;
};
