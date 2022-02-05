import { Ref } from './common';
import { IUser } from './user';
import { IRevision, HasRevisionShortbody } from './revision';
import { ITag } from './tag';
import { HasObjectId } from './has-object-id';
import { SubscriptionStatusType } from './subscription';


export interface IPage {
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

export type IPageInfoCommon = {
  isEmpty: boolean,
  isMovable: boolean,
  isDeletable: boolean,
  isAbleToDeleteCompletely: boolean,
}

export type IPageInfo = IPageInfoCommon & {
  bookmarkCount: number,
  sumOfLikers: number,
  likerIds: string[],
  sumOfSeenUsers: number,
  seenUserIds: string[],

  isBookmarked?: boolean,
  isLiked?: boolean,
  subscriptionStatus?: SubscriptionStatusType,
}

export type IPageInfoForList = IPageInfo & HasRevisionShortbody;

export const isExistPageInfo = (pageInfo: IPageInfoCommon | undefined): pageInfo is IPageInfo => {
  return pageInfo != null && !pageInfo.isEmpty;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isIPageInfoForList = (pageInfo: any): pageInfo is IPageInfoForList => {
  return pageInfo != null && pageInfo.revisionShortBody != null;
};

export type IPageWithMeta<M = Record<string, unknown>> = {
  pageData: IPageHasId,
  pageMeta?: Partial<IPageInfo> & M,
};
