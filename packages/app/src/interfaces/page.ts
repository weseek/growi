import { IUser } from './user';
import { IRevision } from './revision';
import { ITag } from './tag';

export type IPage = {
  path: string,
  status: string,
  revision: any & IRevision,
  tags: (any & ITag)[],
  creator: any & IUser,
  createdAt: Date,
  updatedAt: Date,
  seenUsers: any[],
  parent: any & IPage,
  isEmpty: boolean,
  redirectTo: string,
  grant: number,
  grantedUsers: any,
  grantedGroup: any,
  lastUpdateUser: any,
  liker: any[],
  commentCount: number
  slackChannels: string,
  pageIdOnHackmd: string,
  revisionHackmdSynced: any,
  hasDraftOnHackmd: boolean,
  deleteUser: any,
  deletedAt: Date,
}
