import { IncomingWebhook } from '@slack/webhook';
import { WebClient } from '@slack/web-api';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:util:slack-legacy');

module.exports = function(crowi) {

  const { configManager } = crowi;

  const slackUtilLegacy = {};

  const postWithIwh = async(messageObj) => {
    const webhook = new IncomingWebhook(configManager.getConfig('notification', 'slack:incomingWebhookUrl'));
    try {
      await webhook.send(messageObj);
    }
    catch (error) {
      logger.debug('Post error', error);
      logger.debug('Sent data to slack is:', messageObj);
      throw error;
    }
  };

  const postWithWebApi = async(messageObj) => {
    const client = new WebClient(configManager.getConfig('notification', 'slack:token'));
    try {
      await client.chat.postMessage(messageObj);
    }
    catch (error) {
      logger.debug('Post error', error);
      logger.debug('Sent data to slack is:', messageObj);
      throw error;
    }
  };

  slackUtilLegacy.postMessage = async(messageObj) => {
    // when incoming Webhooks is prioritized
    if (configManager.getConfig('notification', 'slack:isIncomingWebhookPrioritized')) {
      if (configManager.getConfig('notification', 'slack:incomingWebhookUrl')) {
        logger.debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
      if (configManager.getConfig('notification', 'slack:token')) {
        logger.debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
    }
    // else
    else {
      if (configManager.getConfig('notification', 'slack:token')) {
        logger.debug('posting message with Web API');
        return postWithWebApi(messageObj);
      }
      if (configManager.getConfig('notification', 'slack:incomingWebhookUrl')) {
        logger.debug('posting message with IncomingWebhook');
        return postWithIwh(messageObj);
      }
    }
  };

  return slackUtilLegacy;
};
