const debug = require('debug')('growi:service:GlobalNotification');
const Notification = require('../models/global-notification-setting');
const mailer = require('../util/mailer');

const pageCreateMailNotify = (notifications, page) => {
  const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
  mailNotifications.forEach(notification => {
    mailer.send({
      to: notification.notifyTo.toEmail,
      subject: `#pageCreate - ${page.creator.username} created ${page.path}`,
      template: 'notification/pageCreate.txt',
      vars: {}
    });
  });
};

const pageEditMailNotify = (notifications, page) => {
  const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
  mailNotifications.forEach(notification => {
    mailer.send({
      to: notification.notifyTo.toEmail,
      subject: `#pageEdit - ${page.creator.username} edited ${page.path}`,
      template: 'notification/pageEdit.txt',
      vars: {}
    });
  });
};

const pageDeleteMailNotify = (notifications, page) => {
  const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
  mailNotifications.forEach(notification => {
    mailer.send({
      to: notification.notifyTo.toEmail,
      subject: `#pageDelete - ${page.creator.username} deleted ${page.path}`,  //FIXME
      template: 'notification/pageDelete.txt',
      vars: {}
    });
  });
};

const pageMoveMailNotify = (notifications, page) => {
  const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
  mailNotifications.forEach(notification => {
    mailer.send({
      to: notification.notifyTo.toEmail,
      subject: `#pageMove - ${page.creator.username} moved ${page.path} to ${page.path}`, //FIXME
      template: 'notification/pageMove.txt',
      vars: {}
    });
  });
};

const pageLikeMailNotify = (notifications, page) => {
  const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
  mailNotifications.forEach(notification => {
    mailer.send({
      to: notification.notifyTo.toEmail,
      subject: `#pageLike - ${page.creator.username} liked ${page.path}`,
      template: 'notification/pageLike.txt',
      vars: {}
    });
  });
};

const commentMailNotify = (notifications, comment, path) => {
  const mailNotifications = notifications.filter(notification => notification.notifyTo.type === 'mail');
  mailNotifications.forEach(notification => {
    mailer.send({
      to: notification.notifyTo.toEmail,
      subject: `#comment - ${comment.creator.username} commented on ${path}`,
      template: 'notification/comment.txt',
      vars: {}
    });
  });
};

/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotification {

  constructor(crowi) {
    this.crowi = crowi;
    this.config = crowi.getConfig();
  }

  /**
   * send notification at page creation
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageCreateNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageCreate');
    pageCreateMailNotify(notifications, page);
    // slackNotify(notifications, page);
  }

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageEditNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageEdit');
    pageEditMailNotify(notifications, page);
    // slackNotify(notifications, page);
  }

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageDeleteNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageDelete');
    pageDeleteMailNotify(notifications, page);
    // slackNotify(notifications, page);
  }

  /**
   * send notification at page move
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageMoveNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageMove');
    pageMoveMailNotify(notifications, page);
    // slackNotify(notifications, page);
  }

  /**
   * send notification at page like
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  sendPageLikeNotification(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageLike');
    pageLikeMailNotify(notifications, page);
    // slackNotify(notifications, page);
  }

  /**
   * send notification at page comment
   * @memberof GlobalNotification
   * @param {obejct} page
   * @param {obejct} comment
   */
  sendCommentNotification(comment, path) {
    const notifications = Notification.findSettingByPathAndEvent(path, 'comment');
    commentMailNotify(notifications, comment, path);
    // slackNotify(notifications, comment, path);
  }
}

module.exports = GlobalNotification;
