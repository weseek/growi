import mongoose from 'mongoose';

import { WebClient } from '@slack/web-api';
import { generateWebClient, markdownSectionBlock } from '@growi/slack';


import loggerFactory from '~/utils/logger';
import S2sMessage from '../models/vo/s2s-message';

import ConfigManager from './config-manager';
import { S2sMessagingService } from './s2s-messaging/base';
import { S2sMessageHandlable } from './s2s-messaging/handlable';


const logger = loggerFactory('growi:service:SlackBotService');


type S2sMessageForSlackIntegration = S2sMessage & { updatedAt: Date };

export class SlackIntegrationService implements S2sMessageHandlable {

  crowi!: any;

  configManager!: ConfigManager;

  s2sMessagingService!: S2sMessagingService;

  lastLoadedAt?: Date;

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;
    this.s2sMessagingService = crowi.s2sMessagingService;

    this.initialize();
  }

  initialize() {
    this.lastLoadedAt = new Date();
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage: S2sMessageForSlackIntegration): boolean {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'slackIntegrationServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }


  /**
   * @inheritdoc
   */
  async handleS2sMessage(): Promise<void> {
    const { configManager } = this.crowi;

    logger.info('Reset slack bot by pubsub notification');
    await configManager.loadConfigs();
    this.initialize();
  }

  async publishUpdatedMessage(): Promise<void> {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('slackIntegrationServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }

  get isSlackConfigured(): boolean {
    // for legacy util
    const hasSlackToken = !!this.configManager.getConfig('notification', 'slack:token');
    const hasSlackIwhUrl = !!this.configManager.getConfig('notification', 'slack:incomingWebhookUrl');
    // for slackbot
    const hasSlackbotType = !!this.configManager.getConfig('crowi', 'slackbot:currentBotType');

    return hasSlackToken || hasSlackIwhUrl || hasSlackbotType;
  }

  /**
   * generate WebClient instance for 'customBotWithoutProxy' type
   */
  async generateClient(): Promise<WebClient>;

  /**
   * generate WebClient instance by tokenPtoG
   * @param tokenPtoG
   */
  async generateClient(tokenPtoG: string): Promise<WebClient>;

  /**
   * generate WebClient instance by SlackAppIntegration
   * @param slackAppIntegration
   */
  async generateClient(slackAppIntegration?: { tokenGtoP: string }): Promise<WebClient>;

  async generateClient(arg?: string | { tokenGtoP: string }): Promise<WebClient> {
    const SlackAppIntegration = mongoose.model('SlackAppIntegration');

    const currentBotType = this.configManager.getConfig('crowi', 'slackbot:currentBotType');

    if (currentBotType == null) {
      throw new Error('The config \'SLACK_BOT_TYPE\'(ns: \'crowi\', key: \'slackbot:currentBotType\') must be set.');
    }

    // connect directly
    if (currentBotType === 'customBotWithoutProxy') {
      if (arg != null) {
        throw new Error('This method cannot be used with non-null argument under \'customBotWithoutProxy\' type.');
      }

      const token = this.configManager.getConfig('crowi', 'slackbot:token');
      return generateWebClient(token);
    }

    if (arg == null) {
      throw new Error('This method cannot be used with null argument under \'officialBot / customBotWithProxy\' type.');
    }


    let slackAppIntegration;
    if (typeof arg === 'string') {
      slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG: arg });
    }
    else {
      slackAppIntegration = arg;
    }

    // connect to proxy
    const proxyServerUri = this.configManager.getConfig('crowi', 'slackbot:proxyServerUri');
    const serverUri = new URL('/g2s', proxyServerUri);
    const headers = {
      'x-growi-gtop-tokens': slackAppIntegration.tokenGtoP,
    };

    return generateWebClient(undefined, serverUri.toString(), headers);
  }

  async postMessage(messageArgs: ChatPostMessageArguments): Promise<void> {
    // TODO: determine target slack workspace
    const tokenPtoG = '...';
    const client = await this.generateClient(tokenPtoG);

    try {
      await client.chat.postMessage(messageArgs);
  }
    catch (error) {
      logger.debug('Post error', error);
      logger.debug('Sent data to slack is:', messageArgs);
      throw error;
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
