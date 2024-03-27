import type { HasObjectId } from './has-object-id';
import type { IUser } from './user';

export const Origin = {
  View: 'view',
  Editor: 'editor',
} as const;

export type Origin = typeof Origin[keyof typeof Origin];

export const allOrigin = Object.values(Origin);

export type IRevision = {
  body: string,
  author: IUser,
  hasDiffToPrev: boolean;
  createdAt: Date,
  updatedAt: Date,
  origin?: Origin,
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
export type HasRevisionShortbody = {
  revisionShortBody?: string,
}

export type SWRInfinitePageRevisionsResponse = {
  revisions: IRevisionHasPageId[],
  totalCount: number,
  offset: number,
}
