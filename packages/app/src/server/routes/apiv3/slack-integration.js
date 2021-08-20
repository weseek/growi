import loggerFactory from '~/utils/logger';

const express = require('express');
const mongoose = require('mongoose');
const urljoin = require('url-join');

const { verifySlackRequest, generateWebClient, getSupportedGrowiActionsRegExps } = require('@growi/slack');

const logger = loggerFactory('growi:routes:apiv3:slack-integration');
const router = express.Router();
const SlackAppIntegration = mongoose.model('SlackAppIntegration');
const { respondIfSlackbotError } = require('../../service/slack-command-handler/respond-if-slackbot-error');

module.exports = (crowi) => {
  this.app = crowi.express;

  const { configManager } = crowi;

  // Check if the access token is correct
  async function verifyAccessTokenFromProxy(req, res, next) {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    console.log(22, tokenPtoG);

    if (tokenPtoG == null) {
      const message = 'The value of header \'x-growi-ptog-tokens\' must not be empty.';
      logger.warn(message, { body: req.body });
      return res.status(400).send({ message });
    }

    const slackAppIntegrationCount = await SlackAppIntegration.countDocuments({ tokenPtoG });

    logger.debug('verifyAccessTokenFromProxy', {
      tokenPtoG,
      slackAppIntegrationCount,
    });

    if (slackAppIntegrationCount === 0) {
      return res.status(403).send({
        message: 'The access token that identifies the request source is slackbot-proxy is invalid. Did you setup with `/growi register`.\n'
        + 'Or did you delete registration for GROWI ? if so, the link with GROWI has been disconnected. '
        + 'Please unregister the information registered in the proxy and setup `/growi register` again.',
      });
    }
    next();
  }

  async function checkCommandPermission(req, res, next) {
    let payload;
    console.log(48);
    if (req.body.payload) {
      payload = JSON.parse(req.body.payload);
    }
    if (req.body.text == null && !payload) { // when /relation-test
      return next();
    }

    const tokenPtoG = req.headers['x-growi-ptog-tokens'];

    // MOCK DATA DELETE THIS GW-6972 ---------------
    const SlackAppIntegrationMock = mongoose.model('SlackAppIntegrationMock');
    const relation = await SlackAppIntegrationMock.findOne({ tokenPtoG });
    const slackAppIntegrationMock = await SlackAppIntegrationMock.findOne({ tokenPtoG });
    const channelsObject = slackAppIntegrationMock.permittedChannelsForEachCommand._doc.channelsObject;
    // MOCK DATA DELETE THIS GW-6972 ---------------
    const { supportedCommandsForBroadcastUse, supportedCommandsForSingleUse } = relation;
    const supportedCommands = supportedCommandsForBroadcastUse.concat(supportedCommandsForSingleUse);
    const supportedGrowiActionsRegExps = getSupportedGrowiActionsRegExps(supportedCommands);

    // get command name from req.body
    let command = '';
    let actionId = '';
    let callbackId = '';

    if (!payload) { // when request is to /commands
      command = req.body.text.split(' ')[0];
    }
    else if (payload.actions) { // when request is to /interactions && block_actions
      actionId = payload.actions[0].action_id;
    }
    else { // when request is to /interactions && view_submission
      callbackId = payload.view.callback_id;
    }

    // code below checks permission at channel level
    const fromChannel = req.body.channel_name/*  || payload.channel.name; */;
    [...channelsObject.keys()].forEach((commandName) => {
      const permittedChannels = channelsObject.get(commandName);
      // ex. search OR search:hogehoge
      const commandRegExp = new RegExp(`(^${commandName}$)|(^${commandName}:\\w+)`);

      // RegExp check
      if (commandRegExp.test(commandName) || commandRegExp.test(actionId) || commandRegExp.test(callbackId)) {
        // check if the channel is permitted
        if (permittedChannels.includes(fromChannel)) return next();
      }
    });

    // code below checks permission at command level
    let isActionSupported = false;
    supportedGrowiActionsRegExps.forEach((regexp) => {
      if (regexp.test(actionId) || regexp.test(callbackId)) {
        isActionSupported = true;
      }
    });

    // validate
    if (command && !supportedCommands.includes(command)) {
      return res.status(403).send(`It is not allowed to run '${command}' command to this GROWI.`);
    }
    if ((actionId || callbackId) && !isActionSupported) {
      return res.status(403).send(`It is not allowed to run '${command}' command to this GROWI.`);
    }

    next();
  }

  const addSigningSecretToReq = (req, res, next) => {
    req.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:signingSecret');
    return next();
  };

  const generateClientForResponse = (tokenGtoP) => {
    const currentBotType = crowi.configManager.getConfig('crowi', 'slackbot:currentBotType');

    if (currentBotType == null) {
      throw new Error('The config \'SLACK_BOT_TYPE\'(ns: \'crowi\', key: \'slackbot:currentBotType\') must be set.');
    }

    let token;

    // connect directly
    if (tokenGtoP == null) {
      token = crowi.configManager.getConfig('crowi', 'slackbot:token');
      return generateWebClient(token);
    }

    // connect to proxy
    const proxyServerUri = crowi.configManager.getConfig('crowi', 'slackbot:proxyServerUri');
    const serverUri = urljoin(proxyServerUri, '/g2s');
    const headers = {
      'x-growi-gtop-tokens': tokenGtoP,
    };


    return generateWebClient(token, serverUri, headers);
  };

  async function handleCommands(req, res) {
    const { body } = req;

    if (body.text == null) {
      return 'No text.';
    }

    /*
     * TODO: use parseSlashCommand
     */

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const tokenPtoG = req.headers['x-growi-ptog-tokens'];

    // generate client
    let client;
    if (tokenPtoG == null) {
      client = generateClientForResponse();
    }
    else {
      const SlackAppIntegrationMock = mongoose.model('SlackAppIntegrationMock');
      const slackAppIntegrationMock = await SlackAppIntegrationMock.findOne({ tokenPtoG });
      // const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });
      client = generateClientForResponse(slackAppIntegrationMock.tokenGtoP);
    }

    const args = body.text.split(' ');
    const command = args[0];

    try {
      await crowi.slackBotService.handleCommandRequest(command, client, body, args);
    }
    catch (err) {
      await respondIfSlackbotError(client, body, err);
    }

  }

  router.post('/commands', addSigningSecretToReq, verifySlackRequest, async(req, res) => {
    return handleCommands(req, res);
  });

  router.post('/proxied/commands', verifyAccessTokenFromProxy, checkCommandPermission, async(req, res) => {
    const { body } = req;
    console.log(195, body);
    // eslint-disable-next-line max-len
    // see: https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls__request-url-configuration--verification
    if (body.type === 'url_verification') {
      return res.send({ challenge: body.challenge });
    }

    return handleCommands(req, res);
  });

  async function handleInteractions(req, res) {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();


    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    // generate client
    let client;
    if (tokenPtoG == null) {
      client = generateClientForResponse();
    }
    else {
      const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });
      client = generateClientForResponse(slackAppIntegration.tokenGtoP);
    }

    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    try {
      switch (type) {
        case 'block_actions':
          try {
            await crowi.slackBotService.handleBlockActionsRequest(client, payload);
          }
          catch (err) {
            await respondIfSlackbotError(client, req.body, err);
          }
          break;
        case 'view_submission':
          try {
            await crowi.slackBotService.handleViewSubmissionRequest(client, payload);
          }
          catch (err) {
            await respondIfSlackbotError(client, req.body, err);
          }
          break;
        default:
          break;
      }
    }
    catch (error) {
      logger.error(error);
    }

  }

  router.post('/interactions', addSigningSecretToReq, verifySlackRequest, async(req, res) => {
    return handleInteractions(req, res);
  });

  router.post('/proxied/interactions', verifyAccessTokenFromProxy, checkCommandPermission, async(req, res) => {
    console.log(req);
    return handleInteractions(req, res);
  });

  router.get('/supported-commands', verifyAccessTokenFromProxy, async(req, res) => {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });

    return res.send(slackAppIntegration);
  });

  return router;
};
