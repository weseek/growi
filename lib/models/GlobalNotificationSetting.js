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
    Parent: Notification,
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
  static async enable(id) {
    // save
    // return Notification
  }

  /**
   * disable notification setting
   * @param {string} id
   */
  static async disable(id) {
    const setting = await this.findOne({_id: id});

    setting.isEnabled = false;
    setting.save();

    return setting;
  }

  /**
   * find a list of notification settings by path and a list of events
   * @param {string} path
   * @param {string} event
   * @param {boolean} enabled
   */
  static async findSettingByPathAndEvent(path, event, enabled) {
    let settings;

    if (enabled == null) {
      settings = this.find();
    }
    else {
      settings = this.find({isEnabled: enabled});
    }

    return await settings;
  }
}

module.exports = function(crowi) {
  GlobalNotificationSetting.crowi = crowi;
  notificationSchema.loadClass(GlobalNotificationSetting);
  return createChildSchemas(notificationSchema, 'GlobalNotificationSetting', 'type');
};
