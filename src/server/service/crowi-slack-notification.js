const logger = require('@alias/logger')('growi:service:CrowiSlackNotification'); // eslint-disable-line no-unused-vars
/**
 * the service class of GlobalNotificationSetting
 */
class CrowiSlackNotificationService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  hasSlackConfig() {
    let hasSlackToken = false;
    let hasSlackIwhUrl = false;

    if (this.configObject.notification) {
      hasSlackToken = !!this.crowi.configManager.getConfig('notification', 'slack:token');
      hasSlackIwhUrl = !!this.crowi.configManager.getConfig('notification', 'slack:incomingWebhookUrl');
    }

    return hasSlackToken || hasSlackIwhUrl;
  }

}

module.exports = CrowiSlackNotificationService;
