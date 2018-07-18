const mongoose = require('mongoose');
const notificationSchema = require('./GlobalNotificationSettingParentSchema');
const GlobalNotificationSettingClass = require('./GlobalNotificationSettingClass');

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
  const slackNotification = Notification.discriminator('slack', new mongoose.Schema({
    slackChannels: String,
  }, {discriminatorKey: discriminatorKey}));

  return slackNotification;
};

module.exports = function(crowi) {
  GlobalNotificationSettingClass.crowi = crowi;
  notificationSchema.loadClass(GlobalNotificationSettingClass);
  return createChildSchemas(notificationSchema, 'GlobalNotificationSetting', 'type');
};
