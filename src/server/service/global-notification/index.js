const logger = require('@alias/logger')('growi:service:GlobalNotificationService');
const nodePath = require('path');
const GloabalNotificationSlack = require('./global-notification-slack');
const GloabalNotificationMail = require('./global-notification-mail');

/**
 * service class of GlobalNotificationSetting
 */
class GlobalNotificationService {

  constructor(crowi) {
    this.crowi = crowi;
    this.defaultLang = 'en-US'; // TODO: get defaultLang from app global config
    this.event = crowi.model('GlobalNotificationSetting').schema.EVENT;

    this.gloabalNotificationMail = new GloabalNotificationMail(crowi);
    this.gloabalNotificationSlack = new GloabalNotificationSlack(crowi);
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationService
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user triggered the event
   * @param {object} vars event specific vars
   */
  async fire(event, path, triggeredBy, vars = {}) {
    const option = await this.generateOption(event, path, triggeredBy, vars);

    logger.debug(`global notficatoin event ${event} was triggered`);

    await Promise.all([
      this.gloabalNotificationMail.fire(event, path, option),
      this.gloabalNotificationSlack.fire(event, path, option),
    ]);
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationService
   *
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   *
   * @return  {{ subject: string, template: string, vars: object }}
   */
  async generateOption(event, path, triggeredBy, { comment, oldPath }) {
    // validate for all events
    if (event == null || path == null || triggeredBy == null) {
      throw new Error(`invalid vars supplied to generateOption for event ${event}`);
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
          throw new Error(`invalid vars supplied to generateOption for event ${event}`);
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
          throw new Error(`invalid vars supplied to generateOption for event ${event}`);
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

module.exports = GlobalNotificationService;
