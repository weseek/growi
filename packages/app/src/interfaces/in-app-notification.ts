import { IUser } from './user';

export interface IInAppNotification {
  _id: string
  user: string
  targetModel: 'Page'
  target: any /* Need to set "Page" as a type" */
  action: 'COMMENT' | 'LIKE'
  status: string
  actionUsers: IUser[]
  createdAt: string
}
