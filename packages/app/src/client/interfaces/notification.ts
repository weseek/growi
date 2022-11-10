import type { NotifyType } from './global-notification';

export type INotificationType = {
  __t: NotifyType | undefined
  _id: string
  // TOOD: Define the provider type
  provider: any
}
