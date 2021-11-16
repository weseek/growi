import { Types } from 'mongoose';
import { IUser } from './user';
import { IPage } from './page';

export interface IInAppNotification {
  _id: Types.ObjectId
  user: IUser
  targetModel: 'Page'
  target: IPage
  action: 'COMMENT' | 'LIKE'
  status: string
  actionUsers: IUser[]
  createdAt: Date
}
