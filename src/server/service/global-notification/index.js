const logger = require('@alias/logger')('growi:service:GlobalNotificationService');
const GloabalNotificationSlack = require('./global-notification-slack');
const GloabalNotificationMail = require('./global-notification-mail');

/**
 * service class of GlobalNotificationSetting
 */
class GlobalNotificationService {

  constructor(crowi) {
    this.crowi = crowi;
    this.defaultLang = 'en-US'; // TODO: get defaultLang from app global config

    this.gloabalNotificationMail = new GloabalNotificationMail(crowi);
    this.gloabalNotificationSlack = new GloabalNotificationSlack(crowi);
  }

  /**
   * fire global notification
   *
   * @memberof GlobalNotificationService
   *
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user who triggered the event
   * @param {object} vars event specific vars
   */
  async fire(event, path, triggeredBy, vars = {}) {
    logger.debug(`global notficatoin event ${event} was triggered`);

    // validation
    if (event == null || path == null || triggeredBy == null) {
      throw new Error(`invalid vars supplied to GlobalNotificationSlackService.generateOption for event ${event}`);
    }

    await Promise.all([
      this.gloabalNotificationMail.fire(event, path, triggeredBy, vars),
      this.gloabalNotificationSlack.fire(event, path, triggeredBy, vars),
    ]);
  }

}

module.exports = GlobalNotificationService;
