const logger = require('@alias/logger')('growi:service:GlobalNotificationMailService'); // eslint-disable-line no-unused-vars

/**
 * sub service class of GlobalNotificationSetting
 */
class GlobalNotificationMailService {

  constructor(crowi) {
    this.crowi = crowi;
    this.type = 'mail';
    this.mailer = crowi.getMailer();
  }

  /**
   * send mail global notification
   *
   * @memberof GlobalNotificationMailService
   * @param {string} event
   * @param {string} path
   * @param {obejct} option
   */
  async fire(event, path, option) {
    const GlobalNotification = this.crowi.model('GlobalNotificationSetting');
    const notifications = await GlobalNotification.findSettingByPathAndEvent(event, path, this.type);

    await Promise.all(notifications.map((notification) => {
      return this.mailer.send({ ...option, to: notification.toEmail });
    }));
  }

}

module.exports = GlobalNotificationMailService;
