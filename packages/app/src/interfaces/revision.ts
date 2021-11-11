import { IUser } from './user';

export type IRevision = {
  body: string,
  author: IUser,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
}

export type IRevisionHasId = IRevision & {
  _id: string,
};
