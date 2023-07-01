import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:GlobalNotificationMailService'); // eslint-disable-line no-unused-vars
const nodePath = require('path');

/**
 * sub service class of GlobalNotificationSetting
 */
class GlobalNotificationMailService {

  constructor(crowi) {
    this.crowi = crowi;
    this.type = crowi.model('GlobalNotificationSetting').TYPE.MAIL;
    this.event = crowi.model('GlobalNotificationSetting').EVENT;
  }

  /**
   * send mail global notification
   *
   * @memberof GlobalNotificationMailService
   *
   * @param {string} event event name triggered
   * @param {import('~/server/models/page').PageDocument} page page triggered the event
   * @param {User} triggeredBy user who triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   */
  async fire(event, page, triggeredBy, vars) {
    const { mailService } = this.crowi;

    const GlobalNotification = this.crowi.model('GlobalNotificationSetting');
    const notifications = await GlobalNotification.findSettingByPathAndEvent(event, page.path, this.type);

    const option = this.generateOption(event, page, triggeredBy, vars);

    await Promise.all(notifications.map((notification) => {
      return mailService.send({ ...option, to: notification.toEmail });
    }));
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationMailService
   *
   * @param {string} event event name triggered
   * @param {import('~/server/models/page').PageDocument} page path triggered the event
   * @param {User} triggeredBy user triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   *
   * @return  {{ subject: string, template: string, vars: object }}
   */
  generateOption(event, page, triggeredBy, { comment, oldPath }) {
    const locale = configManager.getConfig('crowi', 'app:globalLang');
    // validate for all events
    if (event == null || page == null || triggeredBy == null) {
      throw new Error(`invalid vars supplied to GlobalNotificationMailService.generateOption for event ${event}`);
    }

    const template = nodePath.join(this.crowi.localeDir, `${locale}/notifications/${event}.ejs`);

    const path = page.path;
    const appTitle = this.crowi.appService.getAppTitle();
    const siteUrl = this.crowi.appService.getSiteUrl();
    const pageUrl = new URL(page._id, siteUrl);

    let subject;
    let vars = {
      appTitle,
      siteUrl,
      path,
      username: triggeredBy.username,
    };

    switch (event) {
      case this.event.PAGE_CREATE:
        subject = `#${event} - ${triggeredBy.username} created ${path} at URL: ${pageUrl}`;
        break;

      case this.event.PAGE_EDIT:
        subject = `#${event} - ${triggeredBy.username} edited ${path} at URL: ${pageUrl}`;
        break;

      case this.event.PAGE_DELETE:
        subject = `#${event} - ${triggeredBy.username} deleted ${path} at URL: ${pageUrl}`;
        break;

      case this.event.PAGE_MOVE:
        // validate for page move
        if (oldPath == null) {
          throw new Error(`invalid vars supplied to GlobalNotificationMailService.generateOption for event ${event}`);
        }

        subject = `#${event} - ${triggeredBy.username} moved ${oldPath} to ${path} at URL: ${pageUrl}`;
        vars = {
          ...vars,
          oldPath,
          newPath: path,
        };
        break;

      case this.event.PAGE_LIKE:
        subject = `#${event} - ${triggeredBy.username} liked ${path} at URL: ${pageUrl}`;
        break;

      case this.event.COMMENT:
        // validate for comment
        if (comment == null) {
          throw new Error(`invalid vars supplied to GlobalNotificationMailService.generateOption for event ${event}`);
        }

        subject = `#${event} - ${triggeredBy.username} commented on ${path} at URL: ${pageUrl}`;
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
