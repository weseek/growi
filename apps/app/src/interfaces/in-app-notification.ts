import type { IPageSnapshot } from '~/models/serializers/in-app-notification-snapshot/page';

import { IPage } from './page';
import { IUser } from './user';

export enum InAppNotificationStatuses {
  STATUS_UNREAD = 'UNREAD',
  STATUS_UNOPENED = 'UNOPENED',
  STATUS_OPENED = 'OPENED',
}

export interface IInAppNotification {
  user: IUser
  targetModel: 'Page'
  target: IPage
  action: 'COMMENT' | 'LIKE'
  status: InAppNotificationStatuses
  actionUsers: IUser[]
  createdAt: Date
  snapshot: string
  parsedSnapshot?: IPageSnapshot
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
* In App Notification Settings
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
export interface IInAppNotificationSettings<UserID> {
  userId: UserID | string;
  subscribeRules: ISubscribeRule[];
}
