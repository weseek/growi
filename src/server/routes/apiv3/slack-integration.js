const express = require('express');

const loggerFactory = require('@alias/logger');

const { verifySlackRequest } = require('@growi/slack');

const logger = loggerFactory('growi:routes:apiv3:slack-integration');
const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;

  const { configManager } = crowi;

  // Check if the access token is correct
  function verifyAccessTokenFromProxy(req, res, next) {
    const { body } = req;
    const { tokenPtoG } = body;

    const correctToken = configManager.getConfig('crowi', 'slackbot:access-token');

    logger.debug('verifyAccessTokenFromProxy', {
      tokenPtoG,
      correctToken,
    });

    if (tokenPtoG == null || tokenPtoG !== correctToken) {
      return res.status(403).send({ message: 'The access token that identifies the request source is slackbot-proxy is invalid.' });
    }

    next();
  }

  const addSigningSecretToReq = (req, res, next) => {
    req.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:signingSecret');
    return next();
  };

  async function handleCommands(req, res) {
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
  }

  router.post('/commands', addSigningSecretToReq, verifySlackRequest, async(req, res) => {
    return handleCommands(req, res);
  });

  router.post('/proxied/commands', verifyAccessTokenFromProxy, async(req, res) => {
    const { body } = req;

    // eslint-disable-next-line max-len
    // see: https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls__request-url-configuration--verification
    if (body.type === 'url_verification') {
      return body.challenge;
    }

    return handleCommands(req, res);
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

  async function handleInteractions(req, res) {

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

  }

  router.post('/interactions', addSigningSecretToReq, verifySlackRequest, async(req, res) => {
    return handleInteractions(req, res);
  });

  router.post('/proxied/interactions', verifyAccessTokenFromProxy, async(req, res) => {
    return handleInteractions(req, res);
  });

  return router;
};
