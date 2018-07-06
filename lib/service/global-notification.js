const debug = require('debug')('growi:service:GlobalNotification');

/**
 * the service class of GlobalNotificationSetting
 */
class GlobalNotification {

  constructor() {
  }

  /**
   * send test notification
   * @memberof GlobalNotification
   * @param {string} toEmail
   */
  sendTesteNotification(toEmail) {}

  /**
   * send notification at page creation
   * @memberof GlobalNotification
   * @param {string} toEmail
   * @param {obejct} page
   */
  sendCreateNotification(toEmail, page) {
    // const option = {
    //   to: toEmail,
    //   subject: `#create - ${page.creator.username} created ${page.path}`,
    //   template: 'notification/createPage.txt',
    //   vars: {}
    // };

    // return mailer.send(option)
  }

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   * @param {string} toEmail
   * @param {obejct} page
   */
  sendEditNotification(toEmail, page) {}

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   * @param {string} toEmail
   * @param {obejct} page
   */
  sendDeleteNotification(toEmail, page) {}

  /**
   * send notification at page move
   * @memberof GlobalNotification
   * @param {string} toEmail
   * @param {obejct} page
   */
  sendMoveNotification(toEmail, page) {}

  /**
   * send notification at page like
   * @memberof GlobalNotification
   * @param {string} toEmail
   * @param {obejct} page
   */
  sendLikeNotification(toEmail, page) {}

  /**
   * send notification at page comment
   * @memberof GlobalNotification
   * @param {string} toEmail
   * @param {obejct} page
   * @param {obejct} comment
   */
  sendCommentNotification(toEmail, page, comment) {}
}

module.exports = GlobalNotification;
