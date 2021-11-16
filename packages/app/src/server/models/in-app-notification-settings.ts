import { Schema, Model, Document } from 'mongoose';
import { getOrCreateModel } from '@growi/core';

import { IInAppNotificationSettings, subscribeRuleNames } from '../../interfaces/in-app-notification-settings';

export interface InAppNotificationSettingsDocument extends IInAppNotificationSettings, Document {}
export type InAppNotificationSettingsModel = Model<InAppNotificationSettingsDocument>

const inAppNotificationSettingsSchema = new Schema<InAppNotificationSettingsDocument>({
  userId: { type: Schema.Types.ObjectId },
  subscribeRules: [
    {
      name: { type: String, require: true, enum: subscribeRuleNames },
      isEnabled: { type: Boolean },
    },
  ],
});

// eslint-disable-next-line max-len
export default getOrCreateModel<InAppNotificationSettingsDocument, InAppNotificationSettingsModel>('InAppNotificationSettings', inAppNotificationSettingsSchema);
