import mongoose from 'mongoose';

import { GlobalNotificationSettingType } from '../GlobalNotificationSetting';

const GlobalNotificationSetting = require('./index');

const GlobalNotificationSettingClass = GlobalNotificationSetting.class;
const GlobalNotificationSettingSchema = GlobalNotificationSetting.schema;

module.exports = function(crowi) {
  GlobalNotificationSettingClass.crowi = crowi;
  GlobalNotificationSettingSchema.loadClass(GlobalNotificationSettingClass);

  const GlobalNotificationSettingModel = mongoose.model('GlobalNotificationSetting', GlobalNotificationSettingSchema);
  const GlobalNotificationSlackSettingModel = GlobalNotificationSettingModel.discriminator(
    GlobalNotificationSettingType.SLACK,
    new mongoose.Schema({
      slackChannels: String,
    }, {
      discriminatorKey: 'type',
    }),
  );

  return GlobalNotificationSlackSettingModel;
};
