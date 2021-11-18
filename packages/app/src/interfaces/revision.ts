import { Types } from 'mongoose';
import { IUser } from './user';

export type IRevision = {
  body: string,
  author: IUser,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
}

export type IRevisionOnConflict = {
  revisionId: Types.ObjectId;
  revisionBody: string,
  userName: string,
  userImgPath: string,
  createdAt: Date;
}

export type IConflictRevisions = {
  request: IRevisionOnConflict,
  origin: IRevisionOnConflict,
  latest: IRevisionOnConflict,
}
