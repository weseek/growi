const debug = require('debug')('growi:service:GlobalNotification');
const path = require('path');
const Notification = require('../models/GlobalNotificationSetting');
const mailer = require('../util/mailer');

const testNotifyData = [
  {
    "_id": "5b45ab384a702f4484010066",
    "isEnabled": true,
    "triggerEvents": ["comment, pageCreate"],
    "__t": "mail",
    "triggerPath": "/*",
    "toEmail": "email@email.com",
    "__v": 0
  },
  {
    "_id": "5b45ab384a702f4484010067",
    "isEnabled": true,
    "triggerEvents": ["comment, pageCreate"],
    "__t": "slack",
    "triggerPath": "/*",
    "slackChannels": "general, random",
    "__v": 0
  }
];

/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotification {

  constructor(crowi) {
    this.crowi = crowi;
    this.config = crowi.getConfig();
  }

  notifyByMail(notification, mailOption) {
    const crowi = this.crowi;
    const mailer = crowi.getMailer();

    mailer.send(Object.assign(mailOption, {to: notification.toEmail}),
      function(err, s) {
        debug('completed to send email: ', err, s);
        next();
      }
    );
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
    const lang = 'en-US'; //FIXME
    const option = {
      mail: {
        subject: `#pageCreate - ${page.creator.username} created ${page.path}`,
        template: path.join(this.crowi.localeDir, lang, 'notifications/pageCreate.txt'),
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
    // const notifications = Notification.findSettingByPathAndEvent(page.path, 'pageEdit');
    const notifications = testNotifyData;
    const lang = 'en-US'; //FIXME
    const option = {
      mail: {
        subject: `#pageEdit - ${page.creator.username} edited ${page.path}`,
        template: `../../locales/${lang}/notifications/pageEdit.txt`,
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
    const lang = 'en-US'; //FIXME
    const option = {
      mail: {
        subject: `#pageDelete - ${page.creator.username} deleted ${page.path}`,  //FIXME
        template: path.join(this.crowi.localeDir, lang, 'notifications/pageDelete.txt'),
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
    const lang = 'en-US'; //FIXME
    const option = {
      mail: {
        subject: `#pageMove - ${page.creator.username} moved ${page.path} to ${page.path}`, //FIXME
        template: path.join(this.crowi.localeDir, lang, 'notifications/pageMove.txt'),
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
    const lang = 'en-US'; //FIXME
    const option = {
      mail: {
        subject: `#pageLike - ${page.creator.username} liked ${page.path}`,
        template: path.join(this.crowi.localeDir, lang, 'notifications/pageLike.txt'),
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
    const lang = 'en-US'; //FIXME
    const option = {
      mail: {
        subject: `#comment - ${comment.creator.username} commented on ${path}`,
        template: path.join(this.crowi.localeDir, lang, 'notifications/comment.txt'),
        vars: {}
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }
}

module.exports = GlobalNotification;
