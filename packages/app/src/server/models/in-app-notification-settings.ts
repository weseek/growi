import { Schema, Model, Document } from 'mongoose';
import { getOrCreateModel } from '../util/mongoose-utils';

export interface IDefaultSubscribeRule {
  name: string,
  isEnabled: boolean;
}
export interface IInAppNotificationSettings {
  userId: Schema.Types.ObjectId;
  defaultSubscribeRules: IDefaultSubscribeRule[];
}

export interface InAppNotificationSettingsDocument extends IInAppNotificationSettings, Document {}
export type InAppNotificationSettingsModel = Model<InAppNotificationSettingsDocument>

const inAppNotificationSettingsSchema = new Schema<IInAppNotificationSettings>({
  userId: { type: String },
  defaultSubscribeRules: [{ name: { type: String }, isEnabled: { type: Boolean } }],
});

// eslint-disable-next-line max-len
export default getOrCreateModel<InAppNotificationSettingsDocument, InAppNotificationSettingsModel>('InAppNotificationSettings', inAppNotificationSettingsSchema);
