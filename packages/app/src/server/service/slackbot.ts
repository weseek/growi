import loggerFactory from '~/utils/logger';
import { S2sMessagingService } from './s2s-messaging/base';
import { S2sMessageHandlable } from './s2s-messaging/handlable';

const logger = loggerFactory('growi:service:SlackBotService');

const { markdownSectionBlock } = require('@growi/slack');

const S2sMessage = require('../models/vo/s2s-message');


class SlackBotService implements S2sMessageHandlable {

  crowi!: any;

  s2sMessagingService!: S2sMessagingService;

  lastLoadedAt?: Date;

  constructor(crowi) {
    this.crowi = crowi;
    this.s2sMessagingService = crowi.s2sMessagingService;

    this.initialize();
  }

  initialize() {
    this.lastLoadedAt = new Date();
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'slackBotServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }


  /**
   * @inheritdoc
   */
  async handleS2sMessage() {
    const { configManager } = this.crowi;

    logger.info('Reset slack bot by pubsub notification');
    await configManager.loadConfigs();
    this.initialize();
  }

  async publishUpdatedMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('slackBotServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }

  /**
   * Handle /commands endpoint
   */
  async handleCommandRequest(command, client, body, ...opt) {
    let module;
    try {
      module = `./slack-command-handler/${command}`;
    }
    catch (err) {
      await this.notCommand(client, body);
    }

    try {
      const handler = require(module)(this.crowi);
      await handler.handleCommand(client, body, ...opt);
    }
    catch (err) {
      throw err;
    }
  }

  async handleBlockActionsRequest(client, payload) {
    const { action_id: actionId } = payload.actions[0];
    const commandName = actionId.split(':')[0];
    const handlerMethodName = actionId.split(':')[1];
    const module = `./slack-command-handler/${commandName}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleBlockActions(client, payload, handlerMethodName);
    }
    catch (err) {
      throw err;
    }
    return;
  }

  async handleViewSubmissionRequest(client, payload) {
    const { callback_id: callbackId } = payload.view;
    const commandName = callbackId.split(':')[0];
    const handlerMethodName = callbackId.split(':')[1];
    const module = `./slack-command-handler/${commandName}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleBlockActions(client, payload, handlerMethodName);
    }
    catch (err) {
      throw err;
    }
    return;
  }

  async notCommand(client, body) {
    logger.error('Invalid first argument');
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'No command',
      blocks: [
        markdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });
    return;
  }

}

module.exports = SlackBotService;
