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
  createdAt: string
}
