const debug = require('debug')('growi:models:GlobalNotificationSetting');
const mongoose = require('mongoose');

/**
 * parent schema in this model
 */
const notificationSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, required: true, default: true },
  triggerPath: { type: String, required: true },
  triggerEvents: { type: [String] },
});

/**
 * create child schemas inherited from parentSchema
 * all child schemas are stored in globalnotificationsettings collection
 * @link{http://url.com module_name}
 * @param {object} parentSchema
 * @param {string} modelName
 * @param {string} discriminatorKey
 */
const createChildSchemas = (parentSchema, modelName, discriminatorKey) => {
  const Notification = mongoose.model(modelName, parentSchema);
  const mailNotification = Notification.discriminator('mail', new mongoose.Schema({
    toEmail: String,
  }, {discriminatorKey: discriminatorKey}));

  const slackNotification = Notification.discriminator('slack', new mongoose.Schema({
    slackChannels: String,
  }, {discriminatorKey: discriminatorKey}));

  return {
    Mail: mailNotification,
    Slack: slackNotification,
  };
};


/**
 * GlobalNotificationSetting Class
 * @class GlobalNotificationSetting
 */
class GlobalNotificationSetting {

  constructor(crowi) {
    this.crowi = crowi;
  }

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
      // if(enabled == null) {
      //   find all
      // }
      // else {
      //   find only enabled/disabled
      // }
      // sort by path in mongoDB

      // return resolve([Notification])
    //}
  }
}

module.exports = function(crowi) {
  GlobalNotificationSetting.crowi = crowi;
  notificationSchema.loadClass(GlobalNotificationSetting);
  return createChildSchemas(notificationSchema, 'GlobalNotificationSetting', 'type');
};
