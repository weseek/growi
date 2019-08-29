const logger = require('@alias/logger')('growi:service:GlobalNotificationMailService'); // eslint-disable-line no-unused-vars
const nodePath = require('path');

/**
 * sub service class of GlobalNotificationSetting
 */
class GlobalNotificationMailService {

  constructor(crowi) {
    this.crowi = crowi;
    this.type = 'mail';
    this.mailer = crowi.getMailer();
    this.event = crowi.model('GlobalNotificationSetting').schema.EVENT;
  }

  /**
   * send mail global notification
   *
   * @memberof GlobalNotificationMailService
   *
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user who triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   */
  async fire(event, path, triggeredBy, vars) {
    const GlobalNotification = this.crowi.model('GlobalNotificationSetting');
    const notifications = await GlobalNotification.findSettingByPathAndEvent(event, path, this.type);

    const option = this.generateOption(event, path, triggeredBy, vars);

    await Promise.all(notifications.map((notification) => {
      return this.mailer.send({ ...option, to: notification.toEmail });
    }));
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationMailService
   *
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   *
   * @return  {{ subject: string, template: string, vars: object }}
   */
  generateOption(event, path, triggeredBy, { comment, oldPath }) {
    // validate for all events
    if (event == null || path == null || triggeredBy == null) {
      throw new Error(`invalid vars supplied to GlobalNotificationMailService.generateOption for event ${event}`);
    }

    const template = nodePath.join(this.crowi.localeDir, `${this.defaultLang}/notifications/${event}.txt`);
    let subject;
    let vars = {
      appTitle: this.crowi.appService.getAppTitle(),
      path,
      username: triggeredBy.username,
    };

    switch (event) {
      case this.event.PAGE_CREATE:
        subject = `#${event} - ${triggeredBy.username} created ${path}`;
        break;

      case this.event.PAGE_EDIT:
        subject = `#${event} - ${triggeredBy.username} edited ${path}`;
        break;

      case this.event.PAGE_DELETE:
        subject = `#${event} - ${triggeredBy.username} deleted ${path}`;
        break;

      case this.event.PAGE_MOVE:
        // validate for page move
        if (oldPath == null) {
          throw new Error(`invalid vars supplied to GlobalNotificationMailService.generateOption for event ${event}`);
        }

        subject = `#${event} - ${triggeredBy.username} moved ${oldPath} to ${path}`;
        vars = {
          ...vars,
          oldPath,
          newPath: path,
        };
        break;

      case this.event.PAGE_LIKE:
        subject = `#${event} - ${triggeredBy.username} liked ${path}`;
        break;

      case this.event.COMMENT:
        // validate for comment
        if (comment == null) {
          throw new Error(`invalid vars supplied to GlobalNotificationMailService.generateOption for event ${event}`);
        }

        subject = `#${event} - ${triggeredBy.username} commented on ${path}`;
        vars = {
          ...vars,
          comment: comment.comment,
        };
        break;

      default:
        throw new Error(`unknown global notificaiton event: ${event}`);
    }

    return {
      subject,
      template,
      vars,
    };
  }

}

module.exports = GlobalNotificationMailService;
