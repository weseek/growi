const debug = require('debug')('growi:models:global-notification-setting');
const mongoose = require('mongoose');
const Notification = this;

/*
 * define schema
 */
const notificationSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, required: true, default: true },
  triggerPath: { type: String, required: true },
  triggerEvents: { type: [String] },
  notifyTo: { type: String, default: '{}',
    get: data => {
      try {
        return JSON.parse(data);
      }
      catch (e) {
        return data;
      }
    },
    set: data => JSON.stringify(data)
  },
});

/**
 * GlobalNotificationSetting Class
 * @class GlobalNotificationSetting
 */
class GlobalNotificationSetting {

  /**
   * enable notification setting
   * @param {string} id
   */
  static enable(id) {
    // return new Promise((resolve, reject) => {
      // save
      // return resolve(Notification)
    //}
  }

  /**
   * disable notification setting
   * @param {string} id
   */
  static disable(id) {
    // return new Promise((resolve, reject) => {
      // save
      // return resolve(Notification)
    //}
  }

  /**
   * find a list of notification settings by path and a list of events
   * @param {string} path
   * @param {string} event
   * @param {boolean} enabled
   */
  static findSettingByPathAndEvent(path, event, enabled) {
    // return new Promise((resolve, reject) => {
      // sort by path in mongoDB
      // find
      // return resolve([Notification])
    //}
  }
}

module.exports = function(crowi) {
  GlobalNotificationSetting.crowi = crowi;
  notificationSchema.loadClass(GlobalNotificationSetting);
  return mongoose.model('GlobalNotificationSetting', notificationSchema);
};
