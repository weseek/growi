import { IUser } from './user';
import { IRevision } from './revision';
import { ITag } from './tag';

export type IPage = {
  path: string,
  status: string,
  revision: string | IRevision,
  tags?: ITag[],
  lastUpdateUser: any,
  commentCount: number,
  creator: string | IUser,
  seenUsers: string[],
  liker: string[],
  createdAt: Date,
  updatedAt: Date,
};

export type IPageHasId = IPage & {
  _id: string,
};
