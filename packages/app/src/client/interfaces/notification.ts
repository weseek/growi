import type { NotifyType } from './global-notification';

export type INotificationType = {
  // Global notification -> has '__t: slack|mail'
  __t: NotifyType | undefined
  _id: string
  provider: any
}
