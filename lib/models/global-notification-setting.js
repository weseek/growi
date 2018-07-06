module.exports = function(crowi) {
  const debug = require('debug')('growi:models:global-notification-setting');
  const mongoose = require('mongoose');
  const Notification = this;

  let notificationSchema;

  notificationSchema = new mongoose.Schema({
    isEnabled: { type: Boolean, required: true, default: false },
    triggerPath: { type: String, required: true },
    triggerEvents: { type: [String] },
    toEmail: { type: String, required: true },
  });

  /**
   * create new notification setting
   */
  notificationSchema.statics.create = () => {
    // save
    // return Notification
  };

  /**
   * enable notification setting
   * @param {string} id
   */
  notificationSchema.statics.enable = id => {
    // save
    // return Notification
  };

  /**
   * disable notification setting
   * @param {string} id
   */
  notificationSchema.statics.disable = id => {
    // save
    // return Notification
  };

  /**
   * delete notification setting
   * @param {string} id
   */
  notificationSchema.statics.delete = id => {
    // delete notification setting
    // remove
    // return;
  };

  /**
   * update notification setting
   * @param {string} id
   */
  notificationSchema.statics.update = id => {
    // save
    // return Notification
  };

  /**
   * find a notification setting by id
   * @param {string} id
   */
  notificationSchema.statics.findSettingById = id => {
    // findOne
    // return Notification
  };

  /**
   * find a list of notification settings by path and a list of events
   * @param {string} path
   * @param {string} event
   */
  notificationSchema.statics.findSettingByPathAndEvent = (path, event) => {
    // find
    // return [Notification]
  };

  // classify a list of notification settings into enabled and disabled
  notificationSchema.mothods.classify = settings => {
    // return {enabled: [Notification], disabled: [Notification]}
  };

  // returns only enabled notification settings
  notificationSchema.mothods.getEnabeldSettings = settings => {
    // return [Notification]
  };

  // sort a list of notifications by path from short to long
  notificationSchema.mothods.sortByPath = settings => {
    // return [Notification]
  };

  return mongoose.model('GlobalNotificationSetting', notificationSchema);
};


// const notifications = await findSettingByPathAndEvent(path, event);
// notifications.forEach(notification => {
//   notification.send(); //??????????
// });
