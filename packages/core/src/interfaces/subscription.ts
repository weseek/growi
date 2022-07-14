export const SubscriptionStatusType = {
  SUBSCRIBE: 'SUBSCRIBE',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
} as const;
export const AllSubscriptionStatusType = Object.values(SubscriptionStatusType);
export type SubscriptionStatusType = typeof SubscriptionStatusType[keyof typeof SubscriptionStatusType];
