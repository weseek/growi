const debug = require('debug')('growi:models:GlobalNotificationSetting');
const mongoose = require('mongoose');
const GlobalNotificationSetting = require('./GlobalNotificationSetting/index');

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

  return {
    Parent: Notification,
  };
};

module.exports = function(crowi) {
  GlobalNotificationSetting.class.crowi = crowi;
  GlobalNotificationSetting.schema.loadClass(GlobalNotificationSetting.class);
  return createChildSchemas(GlobalNotificationSetting.schema, 'GlobalNotificationSetting', 'type');
};
