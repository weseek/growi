// disable no-return-await for model functions
/* eslint-disable no-return-await */

const mongoose = require('mongoose');
const GlobalNotificationSetting = require('./GlobalNotificationSetting/index');

const GlobalNotificationSettingClass = GlobalNotificationSetting.class;
const GlobalNotificationSettingSchema = GlobalNotificationSetting.schema;

module.exports = function(crowi) {
  GlobalNotificationSettingClass.crowi = crowi;
  GlobalNotificationSettingSchema.loadClass(GlobalNotificationSettingClass);
  return mongoose.model('GlobalNotificationSetting', GlobalNotificationSettingSchema);
};
