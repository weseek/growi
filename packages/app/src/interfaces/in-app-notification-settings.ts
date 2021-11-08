import { Schema } from 'mongoose';

export enum subscribeRuleNames {
  PAGE_CREATE = 'PAGE_CREATE'
}
export interface ISubscribeRule {
  name: subscribeRuleNames;
  isEnabled: boolean;
}
export interface IInAppNotificationSettings {
  userId: Schema.Types.ObjectId;
  subscribeRules: ISubscribeRule[];
}
