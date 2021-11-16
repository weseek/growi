import { Types } from 'mongoose';

export interface IInAppNotification {
  _id: string
  user: string
  targetModel: 'Page'
  target: any /* Need to set "Page" as a type" */
  action: 'COMMENT' | 'LIKE'
  status: string
  actionUsers: any[] /* Need to set "User[]" as a type" */
  createdAt: string
}

/*
* Note:
* Need to use mongoose PaginateResult as a type after upgrading mongoose v6.0.0.
* Until then, use the original "PaginateResult".
*/
export interface PaginateResult<T> {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  offset: number;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

/*
* In App Notification settings
*/

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
