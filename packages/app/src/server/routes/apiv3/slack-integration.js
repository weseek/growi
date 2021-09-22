import { markdownSectionBlock, InvalidGrowiCommandError } from '@growi/slack';
import loggerFactory from '~/utils/logger';

const express = require('express');
const mongoose = require('mongoose');
const urljoin = require('url-join');

const { verifySlackRequest, parseSlashCommand, InteractionPayloadAccessor } = require('@growi/slack');

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

  // REFACTORIMG THIS MIDDLEWARE GW-7441
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

    // IT IS NOT WORKING. FIX THIS GW-7441
    return res.status(403).send('It is not allowed to run the command to this GROWI.');
  }

  // REFACTORIMG THIS MIDDLEWARE GW-7441
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

    // IT IS NOT WORKING FIX. THIS GW-7441
    return res.status(403).send('It is not allowed to run the command to this GROWI.');
  }

  const addSigningSecretToReq = (req, res, next) => {
    req.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:withoutProxy:signingSecret');
    return next();
  };

  const parseSlackInteractionRequest = (req, res, next) => {
    if (req.body.payload == null) {
      return next(new Error('The payload is not in the request from slack or proxy.'));
    }

    req.interactionPayload = JSON.parse(req.body.payload);
    req.interactionPayloadAccessor = new InteractionPayloadAccessor(req.interactionPayload);

    return next();
  };

  async function handleCommands(req, res, client) {
    const { body } = req;
    let { growiCommand } = body;

    if (growiCommand == null) {
      try {
        growiCommand = parseSlashCommand(body);
      }
      catch (err) {
        if (err instanceof InvalidGrowiCommandError) {
          res.json({
            blocks: [
              markdownSectionBlock('*Command type is not specified.*'),
              markdownSectionBlock('Run `/growi help` to check the commands you can use.'),
            ],
          });
        }
        logger.error(err.message);
        return;
      }
    }

    const { text } = growiCommand;


    if (text == null) {
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


    try {
      await crowi.slackIntegrationService.handleCommandRequest(growiCommand, client, body);
    }
    catch (err) {
      await respondIfSlackbotError(client, body, err);
    }

  }

  // TODO: do investigation and fix if needed GW-7519
  router.post('/commands', addSigningSecretToReq, /* verifySlackRequest, */checkCommandsPermission, async(req, res) => {
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

  async function handleInteractionsRequest(req, res, client) {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const { interactionPayload, interactionPayloadAccessor } = req;
    const { type } = interactionPayload;

    try {
      switch (type) {
        case 'block_actions':
          try {
            await crowi.slackIntegrationService.handleBlockActionsRequest(client, interactionPayload, interactionPayloadAccessor);
          }
          catch (err) {
            await respondIfSlackbotError(client, req.body, err);
          }
          break;
        case 'view_submission':
          try {
            await crowi.slackIntegrationService.handleViewSubmissionRequest(client, interactionPayload, interactionPayloadAccessor);
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

  // TODO: do investigation and fix if needed GW-7519
  router.post('/interactions', addSigningSecretToReq, /* verifySlackRequest, */ parseSlackInteractionRequest, checkInteractionsPermission, async(req, res) => {
    const client = await slackIntegrationService.generateClientForCustomBotWithoutProxy();
    return handleInteractionsRequest(req, res, client);
  });

  router.post('/proxied/interactions', verifyAccessTokenFromProxy, parseSlackInteractionRequest, checkInteractionsPermission, async(req, res) => {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const client = await slackIntegrationService.generateClientByTokenPtoG(tokenPtoG);

    return handleInteractionsRequest(req, res, client);
  });

  router.get('/supported-commands', verifyAccessTokenFromProxy, async(req, res) => {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];
    const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = slackAppIntegration;

    return res.apiv3({ permissionsForBroadcastUseCommands, permissionsForSingleUseCommands });
  });

  return router;
};
