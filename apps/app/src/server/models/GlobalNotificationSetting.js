// disable no-return-await for model functions
/* eslint-disable no-return-await */

const mongoose = require('mongoose');
const GlobalNotificationSetting = require('./GlobalNotificationSetting/index');

const GlobalNotificationSettingClass = GlobalNotificationSetting.class;
const GlobalNotificationSettingSchema = GlobalNotificationSetting.schema;

/**
 * global notifcation event master
 */
GlobalNotificationSettingSchema.statics.EVENT = {
  PAGE_CREATE: 'pageCreate',
  PAGE_EDIT: 'pageEdit',
  PAGE_DELETE: 'pageDelete',
  PAGE_MOVE: 'pageMove',
  PAGE_LIKE: 'pageLike',
  COMMENT: 'comment',
};

/**
 * global notifcation type master
 */
GlobalNotificationSettingSchema.statics.TYPE = {
  MAIL: 'mail',
  SLACK: 'slack',
};

module.exports = function(crowi) {
  GlobalNotificationSettingClass.crowi = crowi;
  GlobalNotificationSettingSchema.loadClass(GlobalNotificationSettingClass);
  return mongoose.model('GlobalNotificationSetting', GlobalNotificationSettingSchema);
};
