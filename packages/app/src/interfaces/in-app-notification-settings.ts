import { Schema } from 'mongoose';

export enum subscribeRules {
  PAGE_CREATE = 'PAGE_CREATE'
}
export interface IDefaultSubscribeRule {
  name: subscribeRules;
  isEnabled: boolean;
}
export interface IInAppNotificationSettings {
  userId: Schema.Types.ObjectId;
  defaultSubscribeRules: IDefaultSubscribeRule[];
}
