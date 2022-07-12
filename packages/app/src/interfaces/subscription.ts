import { Ref } from './common';
import { IPage } from './page';
import { IUser } from './user';

export const SubscriptionStatusType = {
  SUBSCRIBE: 'SUBSCRIBE',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
} as const;
export const AllSubscriptionStatusType = Object.values(SubscriptionStatusType);
export type SubscriptionStatusType = typeof SubscriptionStatusType[keyof typeof SubscriptionStatusType];

export interface ISubscription {
  user: Ref<IUser>
  targetModel: string
  target: Ref<IPage>
  status: string
  createdAt: Date

  isSubscribing(): boolean
  isUnsubscribing(): boolean
}
