import type { Ref } from './common';
import type { HasObjectId } from './has-object-id';
import type { IRevision, HasRevisionShortbody, IRevisionHasId } from './revision';
import type { SubscriptionStatusType } from './subscription';
import type { ITag } from './tag';
import type { IUser, IUserGroupHasId, IUserHasId } from './user';

export const GroupType = { userGroup: 'UserGroup', externalUserGroup: 'ExternalUserGroup' } as const;
export type GroupType = typeof GroupType[keyof typeof GroupType];

export type GrantedGroup = {
  type: GroupType,
  item: Ref<any>,
}

export type IPage = {
  path: string,
  status: string,
  revision: Ref<IRevision>,
  tags: Ref<ITag>[],
  creator: any,
  createdAt: Date,
  updatedAt: Date,
  seenUsers: Ref<IUser>[],
  parent: Ref<IPage> | null,
  descendantCount: number,
  isEmpty: boolean,
  grant: PageGrant,
  grantedUsers: Ref<IUser>[],
  grantedGroups: GrantedGroup[],
  lastUpdateUser: Ref<IUser>,
  liker: Ref<IUser>[],
  commentCount: number
  slackChannels: string,
  pageIdOnHackmd: string,
  revisionHackmdSynced: Ref<IRevision>,
  hasDraftOnHackmd: boolean,
  deleteUser: Ref<IUser>,
  deletedAt: Date,
  latestRevision?: Ref<IRevision>,
  latestRevisionBodyLength?: number,
  expandContentWidth?: boolean,
}

export type IPagePopulatedToList = Omit<IPageHasId, 'lastUpdateUser'> & {
  lastUpdateUser: IUserHasId,
}

export type IPagePopulatedToShowRevision = Omit<IPageHasId, 'lastUpdateUser'|'creator'|'deleteUser'|'grantedGroup'|'revision'|'author'> & {
  lastUpdateUser: IUserHasId,
  creator: IUserHasId | null,
  deleteUser: IUserHasId,
  grantedGroup: IUserGroupHasId,
  revision: IRevisionHasId,
  author: IUserHasId,
}

export const PageGrant = {
  GRANT_PUBLIC: 1,
  GRANT_RESTRICTED: 2,
  GRANT_SPECIFIED: 3, // DEPRECATED
  GRANT_OWNER: 4,
  GRANT_USER_GROUP: 5,
} as const;
type UnionPageGrantKeys = keyof typeof PageGrant;
export type PageGrant = typeof PageGrant[UnionPageGrantKeys];

/**
 * Neither pages with grant `GRANT_RESTRICTED` nor `GRANT_SPECIFIED` can be on a page tree.
 */
export type PageGrantCanBeOnTree = typeof PageGrant[Exclude<UnionPageGrantKeys, 'GRANT_RESTRICTED' | 'GRANT_SPECIFIED'>];

export const PageStatus = {
  STATUS_PUBLISHED: 'published',
  STATUS_DELETED: 'deleted',
} as const;
export type PageStatus = typeof PageStatus[keyof typeof PageStatus];

export type IPageHasId = IPage & HasObjectId;

export type IPageInfo = {
  isV5Compatible: boolean,
  isEmpty: boolean,
  isMovable: boolean,
  isDeletable: boolean,
  isAbleToDeleteCompletely: boolean,
  isRevertible: boolean,
}

export type IPageInfoForEntity = IPageInfo & {
  bookmarkCount: number,
  sumOfLikers: number,
  likerIds: string[],
  sumOfSeenUsers: number,
  seenUserIds: string[],
  contentAge: number,
  descendantCount: number,
  commentCount: number,
}

export type IPageInfoForOperation = IPageInfoForEntity & {
  isBookmarked?: boolean,
  isLiked?: boolean,
  subscriptionStatus?: SubscriptionStatusType,
}

export type IPageInfoForListing = IPageInfoForEntity & HasRevisionShortbody;

export type IPageInfoAll = IPageInfo | IPageInfoForEntity | IPageInfoForOperation | IPageInfoForListing;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isIPageInfoForEntity = (pageInfo: any | undefined): pageInfo is IPageInfoForEntity => {
  return pageInfo != null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isIPageInfoForOperation = (pageInfo: any | undefined): pageInfo is IPageInfoForOperation => {
  return pageInfo != null
    && isIPageInfoForEntity(pageInfo)
    && ('isBookmarked' in pageInfo || 'isLiked' in pageInfo || 'subscriptionStatus' in pageInfo);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isIPageInfoForListing = (pageInfo: any | undefined): pageInfo is IPageInfoForListing => {
  return pageInfo != null
    && isIPageInfoForEntity(pageInfo)
    && 'revisionShortBody' in pageInfo;
};

// export type IPageInfoTypeResolver<T extends IPageInfo> =
//   T extends HasRevisionShortbody ? IPageInfoForListing :
//   T extends { isBookmarked?: boolean } | { isLiked?: boolean } | { subscriptionStatus?: SubscriptionStatusType } ? IPageInfoForOperation :
//   T extends { bookmarkCount: number } ? IPageInfoForEntity :
//   T extends { isEmpty: number } ? IPageInfo :
//   T;

/**
 * Union Distribution
 * @param pageInfo
 * @returns
 */
// export const resolvePageInfo = <T extends IPageInfo>(pageInfo: T | undefined): IPageInfoTypeResolver<T> => {
//   return <IPageInfoTypeResolver<T>>pageInfo;
// };

export type IDataWithMeta<D = unknown, M = unknown> = {
  data: D,
  meta?: M,
}

export type IPageWithMeta<M = IPageInfoAll> = IDataWithMeta<IPageHasId, M>;

export type IPageToDeleteWithMeta<T = IPageInfoForEntity | unknown> = IDataWithMeta<HasObjectId & (IPage | { path: string, revision: string | null}), T>;
export type IPageToRenameWithMeta<T = IPageInfoForEntity | unknown> = IPageToDeleteWithMeta<T>;
