const logger = require('@alias/logger')('growi:service:GlobalNotification');
const path = require('path');
/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotificationService {
  constructor(crowi) {
    this.crowi = crowi;
    this.config = crowi.getConfig();
    this.mailer = crowi.getMailer();
    this.GlobalNotification = crowi.model('GlobalNotificationSetting');
    this.User = crowi.model('User');
    this.Config = crowi.model('Config');
    this.appTitle = this.Config.appTitle(this.config);
  }

  notifyByMail(notification, mailOption) {
    this.mailer.send(Object.assign(mailOption, { to: notification.toEmail }));
  }

  notifyBySlack(notification, slackOption) {
    // send slack notification here
  }

  sendNotification(notifications, option) {
    notifications.forEach((notification) => {
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
  async notifyPageCreate(page) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageCreate');
    const lang = 'en-US'; // FIXME
    const option = {
      mail: {
        subject: `#pageCreate - ${page.creator.username} created ${page.path}`,
        template: `../../locales/${lang}/notifications/pageCreate.txt`,
        vars: {
          appTitle: this.appTitle,
          path: page.path,
          username: page.creator.username,
        },
      },
      slack: {},
    };

    logger.debug('notifyPageCreate', option);

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  async notifyPageEdit(page) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageEdit');
    const lang = 'en-US'; // FIXME
    const option = {
      mail: {
        subject: `#pageEdit - ${page.creator.username} edited ${page.path}`,
        template: path.join(this.crowi.localeDir, `${lang}/notifications/pageEdit.txt`),
        vars: {
          appTitle: this.appTitle,
          path: page.path,
          username: page.creator.username,
        },
      },
      slack: {},
    };

    logger.debug('notifyPageEdit', option);

    this.sendNotification(notifications, option);
  }

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  async notifyPageDelete(page) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageDelete');
    const lang = 'en-US'; // FIXME
    const option = {
      mail: {
        subject: `#pageDelete - ${page.creator.username} deleted ${page.path}`, // FIXME
        template: `../../locales/${lang}/notifications/pageDelete.txt`,
        vars: {
          appTitle: this.appTitle,
          path: page.path,
          username: page.creator.username,
        },
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
  async notifyPageMove(page, oldPagePath, user) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageMove');
    const lang = 'en-US'; // FIXME
    const option = {
      mail: {
        subject: `#pageMove - ${user.username} moved ${page.path} to ${page.path}`, // FIXME
        template: `../../locales/${lang}/notifications/pageMove.txt`,
        vars: {
          appTitle: this.appTitle,
          oldPath: oldPagePath,
          newPath: page.path,
          username: user.username,
        },
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
  async notifyPageLike(page, user) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageLike');
    const lang = 'en-US'; // FIXME
    const option = {
      mail: {
        subject: `#pageLike - ${user.username} liked ${page.path}`,
        template: `../../locales/${lang}/notifications/pageLike.txt`,
        vars: {
          appTitle: this.appTitle,
          path: page.path,
          username: page.creator.username,
        },
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
  async notifyComment(comment, path) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(path, 'comment');
    const lang = 'en-US'; // FIXME
    const user = await this.User.findOne({ _id: comment.creator });
    const option = {
      mail: {
        subject: `#comment - ${user.username} commented on ${path}`,
        template: `../../locales/${lang}/notifications/comment.txt`,
        vars: {
          appTitle: this.appTitle,
          path,
          username: user.username,
          comment: comment.comment,
        },
      },
      slack: {},
    };

    this.sendNotification(notifications, option);
  }
}

module.exports = GlobalNotificationService;
