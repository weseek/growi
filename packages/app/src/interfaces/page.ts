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

export type ISearchedPage = IPage & {
  _id: string,
  noLink: boolean,
  lastUpdateUser: any,
  elasticSearchResult: {
    snippet: string,
  }
}
