import { Ref } from './common';
import { IUser } from './user';
import { IRevision } from './revision';
import { ITag } from './tag';
import { HasObjectId } from './has-object-id';

export type IPage = {
  path: string,
  status: string,
  revision: Ref<IRevision>,
  tags: Ref<ITag>[],
  creator: Ref<IUser>,
  createdAt: Date,
  updatedAt: Date,
  seenUsers: Ref<IUser>[],
  parent: Ref<IPage> | null,
  descendantCount: number,
  isEmpty: boolean,
  redirectTo: string,
  grant: number,
  grantedUsers: Ref<IUser>[],
  grantedGroup: Ref<any>,
  lastUpdateUser: Ref<IUser>,
  liker: Ref<IUser>[],
  commentCount: number
  slackChannels: string,
  pageIdOnHackmd: string,
  revisionHackmdSynced: Ref<IRevision>,
  hasDraftOnHackmd: boolean,
  deleteUser: Ref<IUser>,
  deletedAt: Date,
}

export type IPageHasId = IPage & HasObjectId;

export type IPageForItem = Partial<IPageHasId & {isTarget?: boolean}>;

export type IPageInfo = {
  bookmarkCount: number,
  sumOfLikers: number,
  likerIds: string[],
  sumOfSeenUsers: number,
  seenUserIds: string[],
  isDeletable: boolean,
  isAbleToDeleteCompletely: boolean,
  isBookmarked?: boolean,
  isLiked?: boolean,
}

export type IPageWithMeta<M = Record<string, unknown>> = {
  pageData: IPageHasId,
  pageMeta?: Partial<IPageInfo> & M,
};
