import { Schema } from 'mongoose';

export interface IPage {
  parent: Schema.Types.ObjectId,
  isEmpty: boolean,
  path: string
  revision: Schema.Types.ObjectId,
  redirectTo: string,
  status: string,
  grant: number,
  grantedUsers: Schema.Types.ObjectId[],
  grantedGroup: Schema.Types.ObjectId,
  creator: Schema.Types.ObjectId,
  lastUpdateUser: Schema.Types.ObjectId,
  liker: Schema.Types.ObjectId[],
  seenUsers: Schema.Types.ObjectId[],
  commentCount: number,
  slackChannels: string,
  pageIdOnHackmd: string,
  revisionHackmdSynced: Schema.Types.ObjectId,
  hasDraftOnHackmd: boolean,
  createdAt: Date,
  updatedAt: Date,
  deleteUser: Schema.Types.ObjectId,
  deletedAt: Date,
}
