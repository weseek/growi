const logger = require('@alias/logger')('growi:service:GlobalNotificationSlackService'); // eslint-disable-line no-unused-vars
const urljoin = require('url-join');

/**
 * sub service class of GlobalNotificationSetting
 */
class GlobalNotificationSlackService {

  constructor(crowi) {
    this.crowi = crowi;
    this.slack = crowi.getSlack();
    this.type = crowi.model('GlobalNotificationSetting').TYPE.SLACK;
    this.event = crowi.model('GlobalNotificationSetting').EVENT;
  }

  /**
   * send slack global notification
   *
   * @memberof GlobalNotificationSlackService
   *
   * @param {string} event
   * @param {string} path
   * @param {User} triggeredBy user who triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   */
  async fire(event, path, triggeredBy, vars) {
    const GlobalNotification = this.crowi.model('GlobalNotificationSetting');
    const notifications = await GlobalNotification.findSettingByPathAndEvent(event, path, this.type);

    const messageBody = this.generateMessageBody(event, path, triggeredBy, vars);
    const attachmentBody = this.generateAttachmentBody(event, path, triggeredBy, vars);

    await Promise.all(notifications.map((notification) => {
      return this.slack.sendGlobalNotification(messageBody, attachmentBody, notification.slackChannels);
    }));
  }

  /**
   * generate slack message body
   *
   * @memberof GlobalNotificationSlackService
   *
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   *
   * @return  {string} slack message body
   */
  generateMessageBody(event, path, triggeredBy, { comment, oldPath }) {
    const pageUrl = `<${urljoin(this.crowi.appService.getSiteUrl(), path)}|${path}>`;
    const username = `<${urljoin(this.crowi.appService.getSiteUrl(), 'user', triggeredBy.username)}|${triggeredBy.username}>`;
    let messageBody;

    switch (event) {
      case this.event.PAGE_CREATE:
        messageBody = `:bell: ${username} created ${pageUrl}`;
        break;
      case this.event.PAGE_EDIT:
        messageBody = `:bell: ${username} edited ${pageUrl}`;
        break;
      case this.event.PAGE_DELETE:
        messageBody = `:bell: ${username} deleted ${pageUrl}`;
        break;
      case this.event.PAGE_MOVE:
        // validate for page move
        if (oldPath == null) {
          throw new Error(`invalid vars supplied to GlobalNotificationSlackService.generateOption for event ${event}`);
        }
        // eslint-disable-next-line no-case-declarations
        const oldPageUrl = `<${urljoin(this.crowi.appService.getSiteUrl(), oldPath)}|${oldPath}>`;
        messageBody = `:bell: ${username} moved ${oldPageUrl} to ${pageUrl}`;
        break;
      case this.event.PAGE_LIKE:
        messageBody = `:bell: ${username} liked ${pageUrl}`;
        break;
      case this.event.COMMENT:
        // validate for comment
        if (comment == null) {
          throw new Error(`invalid vars supplied to GlobalNotificationSlackService.generateOption for event ${event}`);
        }
        messageBody = `:bell: ${username} commented on ${pageUrl}`;
        break;
      default:
        throw new Error(`unknown global notificaiton event: ${event}`);
    }

    return messageBody;
  }

  /**
   * generate slack attachment body
   *
   * @memberof GlobalNotificationSlackService
   *
   * @param {string} event event name triggered
   * @param {string} path path triggered the event
   * @param {User} triggeredBy user triggered the event
   * @param {{ comment: Comment, oldPath: string }} _ event specific vars
   *
   * @return  {string} slack attachment body
   */
  generateAttachmentBody(event, path, triggeredBy, { comment, oldPath }) {
    const attachmentBody = '';

    // TODO: create attachment
    // attachment body is intended for comment or page diff

    // switch (event) {
    //   case this.event.PAGE_CREATE:
    //     break;
    //   case this.event.PAGE_EDIT:
    //     break;
    //   case this.event.PAGE_DELETE:
    //     break;
    //   case this.event.PAGE_MOVE:
    //     break;
    //   case this.event.PAGE_LIKE:
    //     break;
    //   case this.event.COMMENT:
    //     break;
    //   default:
    //     throw new Error(`unknown global notificaiton event: ${event}`);
    // }

    return attachmentBody;
  }

}

module.exports = GlobalNotificationSlackService;
