import { IUser } from './user';
import { IRevision, IRevisionHasId } from './revision';
import { ITag } from './tag';

export type IPage = {
  path: string,
  status: string,
  revision: string | IRevision | IRevisionHasId,
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
  revision: IRevisionHasId,
};
