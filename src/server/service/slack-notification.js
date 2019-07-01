const logger = require('@alias/logger')('growi:service:SlackNotification'); // eslint-disable-line no-unused-vars
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
