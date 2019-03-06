const mongoose = require('mongoose');
const GlobalNotificationSetting = require('./GlobalNotificationSetting/index');

const GlobalNotificationSettingClass = GlobalNotificationSetting.class;
const GlobalNotificationSettingSchema = GlobalNotificationSetting.schema;

module.exports = function(crowi) {
  GlobalNotificationSettingClass.crowi = crowi;
  GlobalNotificationSettingSchema.loadClass(GlobalNotificationSettingClass);
  return mongoose.model('GlobalNotificationSetting', GlobalNotificationSettingSchema);
};
