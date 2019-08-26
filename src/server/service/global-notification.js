const logger = require('@alias/logger')('growi:service:GlobalNotification');
const nodePath = require('path');
/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotificationService {

  constructor(crowi) {
    this.crowi = crowi;
    this.mailer = crowi.getMailer();
    this.slack = crowi.slack;
    this.GlobalNotification = crowi.model('GlobalNotificationSetting');
    this.User = crowi.model('User');
    this.appTitle = crowi.appService.getAppTitle();
  }

  notifyByMail(notification, mailOption) {
    this.mailer.send(Object.assign(mailOption, { to: notification.toEmail }));
  }

  notifyBySlack(notification, slackOption) {
    this.slack.sendGlobalNotification(notification, slackOption);
  }

  fire(notifications, option) {
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
    const baseOption = {
      template: nodePath.join(this.crowi.localeDir, `${lang}/notifications/pageCreate.txt`),
      vars: {
        appTitle: this.appTitle,
        path: page.path,
        username: page.creator.username,
      },
    };
    const option = {
      mail: {
        subject: `#pageCreate - ${page.creator.username} created ${page.path}`,
        ...baseOption,
      },
      slack: {
        ...baseOption,
      },
    };

    logger.debug('notifyPageCreate', option);

    this.fire(notifications, option);
  }

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  async notifyPageEdit(page) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageEdit');
    const lang = 'en-US'; // FIXME
    const baseOption = {
      template: nodePath.join(this.crowi.localeDir, `${lang}/notifications/pageEdit.txt`),
      vars: {
        appTitle: this.appTitle,
        path: page.path,
        username: page.creator.username,
      },
    };
    const option = {
      mail: {
        subject: `#pageEdit - ${page.creator.username} edited ${page.path}`,
        ...baseOption,
      },
      slack: {
        ...baseOption,
      },
    };

    logger.debug('notifyPageEdit', option);

    this.fire(notifications, option);
  }

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  async notifyPageDelete(page) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageDelete');
    const lang = 'en-US'; // FIXME
    const baseOption = {
      template: nodePath.join(this.crowi.localeDir, `${lang}/notifications/pageDelete.txt`),
      vars: {
        appTitle: this.appTitle,
        path: page.path,
        username: page.creator.username,
      },
    };
    const option = {
      mail: {
        subject: `#pageDelete - ${page.creator.username} deleted ${page.path}`, // FIXME
        ...baseOption,
      },
      slack: {
        ...baseOption,

      },
    };

    this.fire(notifications, option);
  }

  /**
   * send notification at page move
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  async notifyPageMove(page, oldPagePath, user) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageMove');
    const lang = 'en-US'; // FIXME
    const baseOption = {
      template: nodePath.join(this.crowi.localeDir, `${lang}/notifications/pageMove.txt`),
      vars: {
        appTitle: this.appTitle,
        oldPath: oldPagePath,
        newPath: page.path,
        username: user.username,
      },
    };
    const option = {
      mail: {
        subject: `#pageMove - ${user.username} moved ${page.path} to ${page.path}`, // FIXME
        ...baseOption,
      },
      slack: {
        ...baseOption,
      },
    };

    this.fire(notifications, option);
  }

  /**
   * send notification at page like
   * @memberof GlobalNotification
   * @param {obejct} page
   */
  async notifyPageLike(page, user) {
    const notifications = await this.GlobalNotification.findSettingByPathAndEvent(page.path, 'pageLike');
    const lang = 'en-US'; // FIXME
    const baseOption = {
      template: nodePath.join(this.crowi.localeDir, `${lang}/notifications/pageLike.txt`),
      vars: {
        appTitle: this.appTitle,
        path: page.path,
        username: page.creator.username,
      },
    };
    const option = {
      mail: {
        subject: `#pageLike - ${user.username} liked ${page.path}`,
        ...baseOption,
      },
      slack: {
        ...baseOption,
      },
    };

    this.fire(notifications, option);
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
    const baseOption = {
      template: nodePath.join(this.crowi.localeDir, `${lang}/notifications/comment.txt`),
      vars: {
        appTitle: this.appTitle,
        path,
        username: user.username,
        comment: comment.comment,
      },
    };
    const option = {
      mail: {
        subject: `#comment - ${user.username} commented on ${path}`,
        ...baseOption,
      },
      slack: {
        ...baseOption,
      },
    };

    this.fire(notifications, option);
  }

}

module.exports = GlobalNotificationService;
