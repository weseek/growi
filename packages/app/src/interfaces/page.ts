import { IUser } from './user';
import { IRevision } from './revision';
import { ITag } from './tag';

export type IPage = {
  path: string,
  status: string,
  revision: IRevision,
  tags: ITag[],
  creator: IUser,
  createdAt: Date,
  updatedAt: Date,
  seenUsers: string[]
}
