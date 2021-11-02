import { Schema } from 'mongoose';

export interface IDefaultSubscribeRule {
  name: string,
  isEnabled: boolean;
}
export interface IInAppNotificationSettings {
  userId: Schema.Types.ObjectId;
  defaultSubscribeRules: IDefaultSubscribeRule[];
}
