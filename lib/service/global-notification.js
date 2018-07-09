const debug = require('debug')('growi:service:GlobalNotification');
const Notification = require('../models/global-notification-setting');
const mailer = require('../util/mailer');

/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotification {

  constructor(crowi) {
    this.crowi = crowi;
    this.config = crowi.getConfig();
  }

  mailNotify(notification, option) {
    mailer.send(Object.assign(option, {to: notification.notifyTo.toEmail}));
  }

  /**
   * send notification at page creation
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageCreateNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageCreate');
    const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
    const option = {
      subject: `#pageCreate - ${page.creator.username} created ${page.path}`,
      template: 'notification/pageCreate.txt',
      vars: {}
    };
    mailNotifications.forEach(notification => {
      this.mailNotify(notification, option);
    });
  }

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageEditNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageEdit');
    const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
    const option = {
      subject: `#pageEdit - ${page.creator.username} edited ${page.path}`,
      template: 'notification/pageEdit.txt',
      vars: {}
    };
    mailNotifications.forEach(notification => {
      this.mailNotify(notification, option);
    });
  }

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageDeleteNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageDelete');
    const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
    const option = {
      subject: `#pageDelete - ${page.creator.username} deleted ${page.path}`,  //FIXME
      template: 'notification/pageDelete.txt',
      vars: {}
    };
    mailNotifications.forEach(notification => {
      this.mailNotify(notification, option);
    });
  }

  /**
   * send notification at page move
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageMoveNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageMove');
    const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
    const option = {
      subject: `#pageMove - ${page.creator.username} moved ${page.path} to ${page.path}`, //FIXME
      template: 'notification/pageMove.txt',
      vars: {}
    };
    mailNotifications.forEach(notification => {
      this.mailNotify(notification, option);
    });
  }

  /**
   * send notification at page like
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageLikeNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageLike');
    const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
    mailNotifications.forEach(notification => {
      mailer.send({
        to: notification.notifyTo.toEmail,
        subject: `#pageLike - ${page.creator.username} liked ${page.path}`,
        template: 'notification/pageLike.txt',
        vars: {}
      });
    });
  }

  /**
   * send notification at page comment
   * @memberof GlobalNotification
   * @param {obejct} page
   * @param {obejct} comment
   */
  sendCommentNotification(comment, path) {
    const notifications = Notification.findSettingByPathAndEvent(path, 'comment');
    const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
    mailNotifications.forEach(notification => {
      mailer.send({
        to: notification.notifyTo.toEmail,
        subject: `#comment - ${comment.creator.username} commented on ${path}`,
        template: 'notification/comment.txt',
        vars: {}
      });
    });
  }
}

module.exports = GlobalNotification;
