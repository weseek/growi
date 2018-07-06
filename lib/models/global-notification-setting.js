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
   * @param {string} triggerPath
   * @param {[string]} triggerEvents
   * @param {string} toEmail
   */
  notificationSchema.statics.create = (triggerPath, triggerEvents, toEmail) => {
    // return new Promise((resolve, reject) => {
      // save
      // return resolve(Notification)
    //}
  };

  /**
   * enable notification setting
   * @param {string} id
   */
  notificationSchema.statics.enable = id => {
    // return new Promise((resolve, reject) => {
      // save
      // return resolve(Notification)
    //}
  };

  /**
   * disable notification setting
   * @param {string} id
   */
  notificationSchema.statics.disable = id => {
    // return new Promise((resolve, reject) => {
      // save
      // return resolve(Notification)
    //}
  };

  /**
   * delete notification setting
   * @param {string} id
   */
  notificationSchema.statics.delete = id => {
    // return new Promise((resolve, reject) => {
      // remove
      // return resolve()
    //}
  };

  /**
   * update notification setting
   * @param {string} id
   */
  notificationSchema.statics.update = id => {
    // return new Promise((resolve, reject) => {
      // save
      // return resolve(Notification)
    //}
  };

  /**
   * find a notification setting by id
   * @param {string} id
   */
  notificationSchema.statics.findSettingById = id => {
    // return new Promise((resolve, reject) => {
      // findOne
      // return resolve(Notification)
    //}
  };

  /**
   * find a list of notification settings by path and a list of events
   * @param {string} path
   * @param {string} event
   */
  notificationSchema.statics.findSettingByPathAndEvent = (path, event) => {
    // return new Promise((resolve, reject) => {
      // find
      // return resolve([Notification])
    //}
  };

  // classify a list of notification settings into enabled and disabled
  notificationSchema.methods.classify = settings => {
    // return resolve({enabled: [Notification], disabled: [Notification]})
  };

  // returns only enabled notification settings
  notificationSchema.methods.getEnabeldSettings = settings => {
    // return resolve([Notification])
  };

  // sort a list of notifications by path from short to long
  notificationSchema.methods.sortByPath = settings => {
    // return resolve([Notification])
  };

  return mongoose.model('GlobalNotificationSetting', notificationSchema);
};
