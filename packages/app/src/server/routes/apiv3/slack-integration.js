import loggerFactory from '~/utils/logger';

const express = require('express');
const mongoose = require('mongoose');
const urljoin = require('url-join');

const { verifySlackRequest, parseSlashCommand } = require('@growi/slack');

const logger = loggerFactory('growi:routes:apiv3:slack-integration');
const router = express.Router();
const SlackAppIntegration = mongoose.model('SlackAppIntegration');
const { respondIfSlackbotError } = require('../../service/slack-command-handler/respond-if-slackbot-error');
const { checkPermission } = require('../../util/slack-integration');

module.exports = (crowi) => {
  this.app = crowi.express;

  const { configManager, slackIntegrationService } = crowi;

  // Check if the access token is correct
  async function verifyAccessTokenFromProxy(req, res, next) {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];

    if (tokenPtoG == null) {
      const message = 'The value of header \'x-growi-ptog-tokens\' must not be empty.';
      logger.warn(message, { body: req.body });
      return res.status(400).send({ message });
    }

    const SlackAppIntegrationCount = await SlackAppIntegration.countDocuments({ tokenPtoG });

    logger.debug('verifyAccessTokenFromProxy', {
      tokenPtoG,
      SlackAppIntegrationCount,
    });

    if (SlackAppIntegrationCount === 0) {
      return res.status(403).send({
        message: 'The access token that identifies the request source is slackbot-proxy is invalid. Did you setup with `/growi register`.\n'
        + 'Or did you delete registration for GROWI ? if so, the link with GROWI has been disconnected. '
        + 'Please unregister the information registered in the proxy and setup `/growi register` again.',
      });
    }

    next();
  }

  async function extractPermissionsCommands(tokenPtoG) {
    const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });
    if (slackAppIntegration == null) return null;
    const permissionsForBroadcastUseCommands = slackAppIntegration.permissionsForBroadcastUseCommands;
    const permissionsForSingleUseCommands = slackAppIntegration.permissionsForSingleUseCommands;

    return { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands };
  }


  async function checkCommandsPermission(req, res, next) {
    if (req.body.text == null) return next(); // when /relation-test
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const extractPermissions = await extractPermissionsCommands(tokenPtoG);

    let commandPermission;
    if (extractPermissions != null) { // with proxy
      const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = extractPermissions;
      commandPermission = Object.fromEntries([...permissionsForBroadcastUseCommands, ...permissionsForSingleUseCommands]);
    }
    else { // without proxy
      commandPermission = JSON.parse(configManager.getConfig('crowi', 'slackbot:withoutProxy:commandPermission'));
    }

    const growiCommand = parseSlashCommand(req.body);
    const fromChannel = req.body.channel_name;
    const isPermitted = checkPermission(commandPermission, growiCommand.growiCommandType, fromChannel);
    if (isPermitted) return next();

    return res.send(`It is not allowed to run '${growiCommand.growiCommandType}' command to this GROWI.`).status(403);
  }

  async function checkInteractionsPermission(req, res, next) {
    const payload = JSON.parse(req.body.payload);
    if (payload == null) return next(); // when /relation-test

    let actionId = '';
    let callbackId = '';
    let fromChannel = '';

    if (payload.actions) { // when request is to /interactions && block_actions
      actionId = payload.actions[0].action_id;
      fromChannel = payload.channel.name;
    }
    else { // when request is to /interactions && view_submission
      callbackId = payload.view.callback_id;
      fromChannel = JSON.parse(payload.view.private_metadata).channelName;
    }

    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const extractPermissions = await extractPermissionsCommands(tokenPtoG);
    let commandPermission;
    if (extractPermissions != null) { // with proxy
      const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = extractPermissions;
      commandPermission = Object.fromEntries([...permissionsForBroadcastUseCommands, ...permissionsForSingleUseCommands]);
    }
    else { // without proxy
      commandPermission = JSON.parse(configManager.getConfig('crowi', 'slackbot:withoutProxy:commandPermission'));
    }

    const callbacIdkOrActionId = callbackId || actionId;
    const isPermitted = checkPermission(commandPermission, callbacIdkOrActionId, fromChannel);
    if (isPermitted) return next();

    return res.status(403).send('It is not allowed to run the command to this GROWI.');
  }

  const addSigningSecretToReq = (req, res, next) => {
    req.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:withoutProxy:signingSecret');
    return next();
  };

  async function handleCommands(req, res, client) {
    const { body } = req;

    if (body.text == null) {
      return 'No text.';
    }

    /*
     * TODO: use parseSlashCommand
     */

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.json({
      response_type: 'ephemeral',
      text: 'Processing your request ...',
    });

    const args = body.text.split(' ');
    const command = args[0];

    try {
      await crowi.slackIntegrationService.handleCommandRequest(command, client, body, args);
    }
    catch (err) {
      await respondIfSlackbotError(client, body, err);
    }

  }

  router.post('/commands', addSigningSecretToReq, verifySlackRequest, checkCommandsPermission, async(req, res) => {
    const client = await slackIntegrationService.generateClientForCustomBotWithoutProxy();
    return handleCommands(req, res, client);
  });

  router.post('/proxied/commands', verifyAccessTokenFromProxy, checkCommandsPermission, async(req, res) => {
    const { body } = req;
    // eslint-disable-next-line max-len
    // see: https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls__request-url-configuration--verification
    if (body.type === 'url_verification') {
      return res.send({ challenge: body.challenge });
    }

    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const client = await slackIntegrationService.generateClientByTokenPtoG(tokenPtoG);
    return handleCommands(req, res, client);
  });

  async function handleInteractions(req, res, client) {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    try {
      switch (type) {
        case 'block_actions':
          try {
            await crowi.slackIntegrationService.handleBlockActionsRequest(client, payload);
          }
          catch (err) {
            await respondIfSlackbotError(client, req.body, err);
          }
          break;
        case 'view_submission':
          try {
            await crowi.slackIntegrationService.handleViewSubmissionRequest(client, payload);
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

  router.post('/interactions', addSigningSecretToReq, verifySlackRequest, checkInteractionsPermission, async(req, res) => {
    const client = await slackIntegrationService.generateClientForCustomBotWithoutProxy();
    return handleInteractions(req, res, client);
  });

  router.post('/proxied/interactions', verifyAccessTokenFromProxy, checkInteractionsPermission, async(req, res) => {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const client = await slackIntegrationService.generateClientByTokenPtoG(tokenPtoG);

    return handleInteractions(req, res, client);
  });

  router.get('/supported-commands', verifyAccessTokenFromProxy, async(req, res) => {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = slackAppIntegration;

    return res.apiv3({ permissionsForBroadcastUseCommands, permissionsForSingleUseCommands });
  });

  return router;
};
