import {
  Schema, Model, Document, Types,
} from 'mongoose';

import { IInAppNotificationSettings, subscribeRuleNames } from '~/interfaces/in-app-notification';

import { getOrCreateModel } from '../util/mongoose-utils';

export interface InAppNotificationSettingsDocument extends IInAppNotificationSettings<Types.ObjectId>, Document {}
export type InAppNotificationSettingsModel = Model<InAppNotificationSettingsDocument>

const inAppNotificationSettingsSchema = new Schema<InAppNotificationSettingsDocument, InAppNotificationSettingsModel>({
  userId: { type: Schema.Types.ObjectId },
  subscribeRules: [
    {
      name: { type: String, required: true, enum: subscribeRuleNames },
      isEnabled: { type: Boolean },
    },
  ],
});

// eslint-disable-next-line max-len
export default getOrCreateModel<InAppNotificationSettingsDocument, InAppNotificationSettingsModel>('InAppNotificationSettings', inAppNotificationSettingsSchema);
