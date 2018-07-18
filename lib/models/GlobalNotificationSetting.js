const mongoose = require('mongoose');
const GlobalNotificationSetting = require('./GlobalNotificationSetting/index');

module.exports = function(crowi) {
  GlobalNotificationSetting.class.crowi = crowi;
  GlobalNotificationSetting.schema.loadClass(GlobalNotificationSetting.class);
  return mongoose.model('GlobalNotificationSetting', GlobalNotificationSetting.schema);
};
