import mongoose from 'mongoose';

import { GlobalNotificationSettingType } from '../GlobalNotificationSetting';

const GlobalNotificationSetting = require('./index');

const GlobalNotificationSettingClass = GlobalNotificationSetting.class;
const GlobalNotificationSettingSchema = GlobalNotificationSetting.schema;

module.exports = function(crowi) {
  GlobalNotificationSettingClass.crowi = crowi;
  GlobalNotificationSettingSchema.loadClass(GlobalNotificationSettingClass);

  const GlobalNotificationSettingModel = mongoose.model('GlobalNotificationSetting', GlobalNotificationSettingSchema);
  const GlobalNotificationMailSettingModel = GlobalNotificationSettingModel.discriminator(
    GlobalNotificationSettingType.MAIL,
    new mongoose.Schema({
      toEmail: String,
    }, {
      discriminatorKey: 'type',
    }),
  );

  return GlobalNotificationMailSettingModel;
};
