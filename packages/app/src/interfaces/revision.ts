import { IUser } from './user';

export type IRevision = {
  body: string,
  author: IUser,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
}

export type IRevisionOnConflict = {
  revisionId: string,
  revisionBody: string,
  createdAt: Date,
  user: IUser
}
