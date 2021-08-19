import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackNotification'); // eslint-disable-line no-unused-vars
/**
 * the service class of SlackNotificationService
 */
class SlackNotificationService {

  constructor(configManager) {
    this.configManager = configManager;
  }

  hasSlackConfig() {
    // for legacy util
    const hasSlackToken = !!this.configManager.getConfig('notification', 'slack:token');
    const hasSlackIwhUrl = !!this.configManager.getConfig('notification', 'slack:incomingWebhookUrl');
    // for slackbot
    const hasSlackbotType = !!this.configManager.getConfig('crowi', 'slackbot:currentBotType');

    return hasSlackToken || hasSlackIwhUrl || hasSlackbotType;
  }

}

module.exports = SlackNotificationService;
