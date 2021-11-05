import { Schema } from 'mongoose';

export enum subscribeRules {
  PAGE_CREATE = 'PAGE_CREATE'
}
export interface ISubscribeRule {
  name: subscribeRules;
  isEnabled: boolean;
}
export interface IInAppNotificationSettings {
  userId: Schema.Types.ObjectId;
  subscribeRules: ISubscribeRule[];
}
