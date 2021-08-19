import mongoose from 'mongoose';

import { IncomingWebhookSendArguments } from '@slack/webhook';
import { ChatPostMessageArguments, ChatPostMessageResponse, WebClient } from '@slack/web-api';
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
    return this.isSlackbotConfigured || this.isSlackLegacyConfigured;
  }

  get isSlackbotConfigured(): boolean {
    const hasSlackbotType = !!this.configManager.getConfig('crowi', 'slackbot:currentBotType');
    return hasSlackbotType;
  }

  get isSlackLegacyConfigured(): boolean {
    // for legacy util
    const hasSlackToken = !!this.configManager.getConfig('notification', 'slack:token');
    const hasSlackIwhUrl = !!this.configManager.getConfig('notification', 'slack:incomingWebhookUrl');

    return hasSlackToken || hasSlackIwhUrl;
  }

  private isCheckTypeValid(): boolean {
    const currentBotType = this.configManager.getConfig('crowi', 'slackbot:currentBotType');
    if (currentBotType == null) {
      throw new Error('The config \'SLACK_BOT_TYPE\'(ns: \'crowi\', key: \'slackbot:currentBotType\') must be set.');
    }

    return true;
  }

  /**
   * generate WebClient instance for 'customBotWithoutProxy' type
   */
  async generateClientForCustomBotWithoutProxy(): Promise<WebClient> {
    this.isCheckTypeValid();

    const token = this.configManager.getConfig('crowi', 'slackbot:token');

    if (token == null) {
      throw new Error('The config \'SLACK_BOT_TOKEN\'(ns: \'crowi\', key: \'slackbot:token\') must be set.');
    }

    return generateWebClient(token);
  }

  /**
   * generate WebClient instance by tokenPtoG
   * @param tokenPtoG
   */
  async generateClientByTokenPtoG(tokenPtoG: string): Promise<WebClient> {
    this.isCheckTypeValid();

    const SlackAppIntegration = mongoose.model('SlackAppIntegration');

    const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });

    if (slackAppIntegration == null) {
      throw new Error('No SlackAppIntegration exists that corresponds to the tokenPtoG specified.');
    }

    return this.generateClientBySlackAppIntegration(slackAppIntegration as unknown as { tokenGtoP: string; });
  }

  /**
   * generate WebClient instance by tokenPtoG
   * @param tokenPtoG
   */
  async generateClientForPrimaryWorkspace(): Promise<WebClient> {
    this.isCheckTypeValid();

    const currentBotType = this.configManager.getConfig('crowi', 'slackbot:currentBotType');

    if (currentBotType === 'customBotWithoutProxy') {
      return this.generateClientForCustomBotWithoutProxy();
    }

    // retrieve primary SlackAppIntegration
    const SlackAppIntegration = mongoose.model('SlackAppIntegration');
    const slackAppIntegration = await SlackAppIntegration.findOne({ isPrimary: true });

    if (slackAppIntegration == null) {
      throw new Error('None of the primary SlackAppIntegration exists.');
    }

    return this.generateClientBySlackAppIntegration(slackAppIntegration as unknown as { tokenGtoP: string; });
  }

  /**
   * generate WebClient instance by SlackAppIntegration
   * @param slackAppIntegration
   */
  async generateClientBySlackAppIntegration(slackAppIntegration: { tokenGtoP: string }): Promise<WebClient> {
    this.isCheckTypeValid();

    // connect to proxy
    const proxyServerUri = this.configManager.getConfig('crowi', 'slackbot:proxyServerUri');
    const serverUri = new URL('/g2s', proxyServerUri);
    const headers = {
      'x-growi-gtop-tokens': slackAppIntegration.tokenGtoP,
    };

    return generateWebClient(undefined, serverUri.toString(), headers);
  }

  async postMessage(messageArgs: ChatPostMessageArguments, slackAppIntegration?: { tokenGtoP: string; }): Promise<void> {
    // use legacy slack configuration
    if (this.isSlackLegacyConfigured && !this.isSlackbotConfigured) {
      return this.postMessageWithLegacyUtil(messageArgs);
    }

    const client = slackAppIntegration == null
      ? await this.generateClientForPrimaryWorkspace()
      : await this.generateClientBySlackAppIntegration(slackAppIntegration);

    try {
      await client.chat.postMessage(messageArgs);
    }
    catch (error) {
      logger.debug('Post error', error);
      logger.debug('Sent data to slack is:', messageArgs);
      throw error;
    }
  }

  private async postMessageWithLegacyUtil(messageArgs: ChatPostMessageArguments | IncomingWebhookSendArguments): Promise<void> {
    const slackLegacyUtil = require('../util/slack-legacy')(this.crowi);

    try {
      await slackLegacyUtil.postMessage(messageArgs);
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
