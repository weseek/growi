const express = require('express');

const crypto = require('crypto');
const qs = require('qs');

const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:slack-bot');

const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;

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

  /**
   * Verify if the request came from slack
   * See: https://api.slack.com/authentication/verifying-requests-from-slack
   */
  // TODO GW-5628 move this to slack package
  function verifyingIsSlackRequest(req, res, next) {
    // Temporary
    req.signingSecret = crowi.configManager.getConfig('crowi', 'slackbot:signingSecret');

    // take out slackSignature and timestamp from header
    const slackSignature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];

    // protect against replay attacks
    const time = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(time - timestamp) > 300) {
      return res.send('Verification failed.');
    }

    // generate growi signature
    const sigBaseString = `v0:${timestamp}:${qs.stringify(req.body, { format: 'RFC1738' })}`;
    const hasher = crypto.createHmac('sha256', req.signingSecret);
    hasher.update(sigBaseString, 'utf8');
    const hashedSigningSecret = hasher.digest('hex');
    const growiSignature = `v0=${hashedSigningSecret}`;

    // compare growiSignature and slackSignature
    if (crypto.timingSafeEqual(Buffer.from(growiSignature, 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
      return next();
    }

    return res.send('Verification failed');
  }

  router.post('/', verificationRequestUrl, verifyingIsSlackRequest, verificationAccessToken, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const { body } = req;
    const args = body.text.split(' ');
    const command = args[0];

    try {
      switch (command) {
        case 'search':
          await crowi.slackBotService.showEphemeralSearchResults(body, args);
          break;
        case 'create':
          await crowi.slackBotService.createModal(body);
          break;
        default:
          await crowi.slackBotService.notCommand(body);
          break;
      }
    }
    catch (error) {
      logger.error(error);
      return res.send(error.message);
    }
  });

  const handleBlockActions = async(payload) => {
    const { action_id: actionId } = payload.actions[0];

    switch (actionId) {
      case 'shareSearchResults': {
        await crowi.slackBotService.shareSearchResults(payload);
        break;
      }
      case 'showNextResults': {
        const parsedValue = JSON.parse(payload.actions[0].value);

        const { body, args, offset } = parsedValue;
        const newOffset = offset + 10;
        await crowi.slackBotService.showEphemeralSearchResults(body, args, newOffset);
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
        await crowi.slackBotService.createPageInGrowi(payload);
        break;
      default:
        break;
    }
  };

  router.post('/interactive', verificationRequestUrl, verifyingIsSlackRequest, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    try {
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
    }
    catch (error) {
      logger.error(error);
      return res.send(error.message);
    }

  });


  return router;
};
