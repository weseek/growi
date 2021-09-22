import mongoose from 'mongoose';

import { IncomingWebhookSendArguments } from '@slack/webhook';
import { ChatPostMessageArguments, WebClient } from '@slack/web-api';

import {
  generateWebClient, GrowiCommand, InteractionPayloadAccessor, markdownSectionBlock, respond, SlackbotType,
} from '@growi/slack';

import loggerFactory from '~/utils/logger';

import S2sMessage from '../models/vo/s2s-message';

import ConfigManager from './config-manager';
import { S2sMessagingService } from './s2s-messaging/base';
import { S2sMessageHandlable } from './s2s-messaging/handlable';


const logger = loggerFactory('growi:service:SlackBotService');

const OFFICIAL_SLACKBOT_PROXY_URI = 'https://slackbot-proxy.growi.org';

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
      throw new Error('The config \'SLACKBOT_TYPE\'(ns: \'crowi\', key: \'slackbot:currentBotType\') must be set.');
    }

    return true;
  }

  get proxyUriForCurrentType(): string {
    const currentBotType = this.configManager.getConfig('crowi', 'slackbot:currentBotType');

    // TODO assert currentBotType is not null and CUSTOM_WITHOUT_PROXY

    let proxyUri: string;

    switch (currentBotType) {
      case SlackbotType.OFFICIAL:
        proxyUri = OFFICIAL_SLACKBOT_PROXY_URI;
        break;
      default:
        proxyUri = this.configManager.getConfig('crowi', 'slackbot:proxyUri');
        break;
    }

    return proxyUri;
  }

  /**
   * generate WebClient instance for CUSTOM_WITHOUT_PROXY type
   */
  async generateClientForCustomBotWithoutProxy(): Promise<WebClient> {
    this.isCheckTypeValid();

    const token = this.configManager.getConfig('crowi', 'slackbot:withoutProxy:botToken');

    if (token == null) {
      throw new Error('The config \'SLACK_BOT_TOKEN\'(ns: \'crowi\', key: \'slackbot:withoutProxy:botToken\') must be set.');
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

    if (currentBotType === SlackbotType.CUSTOM_WITHOUT_PROXY) {
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
    const serverUri = new URL('/g2s', this.proxyUriForCurrentType);
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
  async handleCommandRequest(growiCommand: GrowiCommand, client, body) {
    const { growiCommandType } = growiCommand;
    const module = `./slack-command-handler/${growiCommandType}`;

    try {
      const handler = require(module)(this.crowi);
      await handler.handleCommand(growiCommand, client, body);
    }
    catch (err) {
      await this.notCommand(growiCommand);
      throw err;
    }
  }

  async handleBlockActionsRequest(client, interactionPayload: any, interactionPayloadAccessor: InteractionPayloadAccessor): Promise<void> {
    const { actionId } = interactionPayloadAccessor.getActionIdAndCallbackIdFromPayLoad();
    const commandName = actionId.split(':')[0];
    const handlerMethodName = actionId.split(':')[1];
    const module = `./slack-command-handler/${commandName}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleInteractions(client, interactionPayload, interactionPayloadAccessor, handlerMethodName);
    }
    catch (err) {
      throw err;
    }
    return;
  }

  async handleViewSubmissionRequest(client, interactionPayload: any, interactionPayloadAccessor: InteractionPayloadAccessor): Promise<void> {
    const { callbackId } = interactionPayloadAccessor.getActionIdAndCallbackIdFromPayLoad();
    const commandName = callbackId.split(':')[0];
    const handlerMethodName = callbackId.split(':')[1];
    const module = `./slack-command-handler/${commandName}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleInteractions(client, interactionPayload, interactionPayloadAccessor, handlerMethodName);
    }
    catch (err) {
      throw err;
    }
    return;
  }

  async notCommand(growiCommand: GrowiCommand): Promise<void> {
    logger.error('Invalid first argument');
    await respond(growiCommand.responseUrl, {
      text: 'No command',
      blocks: [
        markdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });
    return;
  }

}
