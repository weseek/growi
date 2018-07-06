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
   */
  sendTesteNotification() {}

  /**
   * send notification at page creation
   * @memberof GlobalNotification
   */
  sendPageCreateNotification() {}

  /**
   * send notification at page edit
   * @memberof GlobalNotification
   */
  sendPageEditNotification() {}

  /**
   * send notification at page deletion
   * @memberof GlobalNotification
   */
  sendPageDeleteNotification() {}

  /**
   * send notification at page move
   * @memberof GlobalNotification
   */
  sendPageMoveNotification() {}

  /**
   * send notification at page like
   * @memberof GlobalNotification
   */
  sendPageLikeNotification() {}

  /**
   * send notification at page comment
   * @memberof GlobalNotification
   */
  sendCommentNotification() {}
}

module.exports = GlobalNotification;

// res.send
// const notifications = await findSettingByPathAndEvent(path, 'comment');
// notifications.forEach(notification => {
//   sendCommentNotification(notification);
// });


// const mailOption = {
//   to: '',
//   from: '',
//   text: '#comment',
//   subject: '',
// };
