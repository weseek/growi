import type { HasObjectId } from './has-object-id';
import type { IUser } from './user';

export type IRevision = {
  body: string,
  bodyLength: number,
  author: IUser,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
}

export type IRevisionHasId = IRevision & HasObjectId;

type HasPageId = {
  pageId: string,
};

export type IRevisionHasPageId = IRevisionHasId & HasPageId;

export type IRevisionsForPagination = {
  revisions: IRevisionHasPageId[], // revisions in one pagination
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

export type SWRInfinitePageRevisionsResponse = {
  revisions: IRevisionHasPageId[],
  totalCount: number,
  offset: number,
}
