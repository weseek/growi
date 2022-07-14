import { HasObjectId } from './has-object-id';
import { IUser } from './user';

export type IRevision = {
  body: string,
  author: IUser,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
}

export type IRevisionHasId = IRevision & HasObjectId;

export type IRevisionsForPagination = {
  revisions: IRevision[], // revisions in one pagination
  totalCounts: number // total counts
}

export type IRevisionOnConflict = {
  revisionId: string,
  revisionBody: string,
  createdAt: Date,
  user: IUser
}

export type HasRevisionShortbody = {
  revisionShortBody?: string,
}
