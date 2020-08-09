import loggerFactory from '~/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:service:SlackNotification');

/**
 * the service class of SlackNotificationService
 */
class SlackNotificationService {

  constructor(configManager) {
    this.configManager = configManager;
  }

  hasSlackConfig() {
    const hasSlackToken = !!this.configManager.getConfig('notification', 'slack:token');
    const hasSlackIwhUrl = !!this.configManager.getConfig('notification', 'slack:incomingWebhookUrl');

    return hasSlackToken || hasSlackIwhUrl;
  }

}

module.exports = SlackNotificationService;
