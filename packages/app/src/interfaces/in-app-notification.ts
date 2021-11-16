// refer types https://github.com/crowi/crowi/blob/eecf2bc821098d2516b58104fe88fae81497d3ea/client/types/crowi.d.ts
import { IUser } from './user';
import { IPage } from './page';

export interface IInAppNotification {
  _id: string
  user: string
  targetModel: 'Page'
  target: IPage
  action: 'COMMENT' | 'LIKE'
  status: string
  actionUsers: IUser[]
  createdAt: Date
}
