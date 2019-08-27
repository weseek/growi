const logger = require('@alias/logger')('growi:service:GlobalNotificationSlackService'); // eslint-disable-line no-unused-vars

/**
 * sub service class of GlobalNotificationSetting
 */
class GlobalNotificationSlackService {

  constructor(crowi) {
    this.crowi = crowi;
    this.type = 'slack';
    this.slack = crowi.getSlack();
  }

  /**
   * send slack global notification
   *
   * @memberof GlobalNotificationSlackService
   * @param {string} event
   * @param {string} path
   * @param {obejct} option
   */
  async fire(event, path, option) {
    const GlobalNotification = this.crowi.model('GlobalNotificationSetting');
    const notifications = await GlobalNotification.findSettingByPathAndEvent(event, path, this.type);

    await Promise.all(notifications.map((notification) => {
      return this.slack.sendGlobalNotification({ ...option, slackChannels: notification.slackChannels });
    }));
  }

}

module.exports = GlobalNotificationSlackService;
