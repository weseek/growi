const debug = require('debug')('growi:service:GlobalNotification');
const Notification = require('../models/GlobalNotificationSetting');
const mailer = require('../util/mailer');

/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotification {

  constructor(crowi) {
    this.crowi = crowi;
    this.config = crowi.getConfig();
  }

  notifyByMail(notification, mailOption) {
    mailer.send(Object.assign(mailOption, {to: notification.toEmail}));
  }

  notifyBySlack(notification, slackOption) {
    // send slack notification here
  }

  sendNotification(notifications, option) {
    notifications.forEach(notification => {
      if (notification.__t === 'mail') {
        this.notifyByMail(notification, option.mail);
      }
      else if (notification.__t === 'slack') {
        this.notifyBySlack(notification, option.slack);
      }
    });
  }

  /**
   * send notification at page creation
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  notifyPageCreate(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageCreate');
    const option = {
      mail: {
        subject: `#pageCreate - ${page.creator.username} created ${page.path}`,
        template: 'notification/pageCreate.txt',
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  notifyPageEdit(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageEdit');
    const option = {
      mail: {
        subject: `#pageEdit - ${page.creator.username} edited ${page.path}`,
        template: 'notification/pageEdit.txt',
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  notifyPageDelete(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageDelete');
    const option = {
      mail: {
        subject: `#pageDelete - ${page.creator.username} deleted ${page.path}`,  //FIXME
        template: 'notification/pageDelete.txt',
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page move
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  notifyPageMove(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageMove');
    const option = {
      mail: {
        subject: `#pageMove - ${page.creator.username} moved ${page.path} to ${page.path}`, //FIXME
        template: 'notification/pageMove.txt',
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page like
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  notifyPageLike(page) {
    const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageLike');
    const option = {
      mail: {
        subject: `#pageLike - ${page.creator.username} liked ${page.path}`,
        template: 'notification/pageLike.txt',
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page comment
   * @memberof GlobalNotification
   * @param {obejct} page
   * @param {obejct} comment
   */
  notifyComment(comment, path) {
    const notifications = Notification.findSettingByPathAndEvent(path, 'comment');
    const option = {
      mail: {
        subject: `#comment - ${comment.creator.username} commented on ${path}`,
        template: 'notification/comment.txt',
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }
}

module.exports = GlobalNotification;
