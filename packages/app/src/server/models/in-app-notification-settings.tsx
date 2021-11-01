import { Schema, Model, Document } from 'mongoose';
import { getOrCreateModel } from '../util/mongoose-utils';

export interface ISubscribeRule {
  name: string,
  isEnabled: boolean;
}

export interface ISubscribeSettings {
  subscribeRules: ISubscribeRule[];
}

export interface IInAppNotificationSettings {
  userId: Schema.Types.ObjectId;
  subscribeSettings: ISubscribeSettings;
}

export interface InAppNotificationSettingsDocument extends IInAppNotificationSettings, Document {}
export type InAppNotificationSettingsModel = Model<InAppNotificationSettingsDocument>

const subscribeSettingsSchema = new Schema<ISubscribeSettings>({
  subscribeRules: {
    type: [
      { name: { type: String }, isEnabled: { type: Boolean } },
    ],
  },
});

const inAppNotificationSettingsSchema = new Schema<IInAppNotificationSettings>({
  userId: { type: String },
  subscribeSettings: subscribeSettingsSchema,
});

// eslint-disable-next-line max-len
export default getOrCreateModel<InAppNotificationSettingsDocument, InAppNotificationSettingsModel>('InAppNotificationSettings', inAppNotificationSettingsSchema);
