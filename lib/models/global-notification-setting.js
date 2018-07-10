const debug = require('debug')('growi:models:global-notification-setting');
const mongoose = require('mongoose');
// const Notification = this;

/*
 * parent schema
 */
const notificationSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, required: true, default: true },
  triggerPath: { type: String, required: true },
  triggerEvents: { type: [String] },
});

/*
 * child schema inherited from notificationSchema
 * stored in globalnotificationsettings collection
 */
const createChildSchemas = (parentSchema, className, modelName, discriminatorKey) => {
  parentSchema.loadClass(className);
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

  // DELETEME
  test(s) {
    console.log(s)
  }
}

module.exports = function(crowi) {
  GlobalNotificationSetting.crowi = crowi;
  return createChildSchemas(
    notificationSchema,
    GlobalNotificationSetting,
    'GlobalNotificationSetting',
    'type',
  );
};
