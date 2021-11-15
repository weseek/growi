import { Types } from 'mongoose';

export enum subscribeRuleNames {
  PAGE_CREATE = 'PAGE_CREATE'
}

export enum SubscribeRuleDescriptions {
  PAGE_CREATE = 'in_app_notification_settings.default_subscribe_rules.page_create',
}

export interface ISubscribeRule {
  name: subscribeRuleNames;
  isEnabled: boolean;
}
export interface IInAppNotificationSettings {
  userId: Types.ObjectId;
  subscribeRules: ISubscribeRule[];
}
