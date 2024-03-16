import type {
  GroupType, IGrantedGroup, IPageHasId, Nullable, PageGrant, Origin,
} from '@growi/core';

import type { ExternalGroupProviderType } from '~/features/external-user-group/interfaces/external-user-group';

import type { IPageOperationProcessData } from './page-operation';

export {
  isIPageInfoForEntity, isIPageInfoForOperation, isIPageInfoForListing,
} from '@growi/core';

export type IPageForItem = Partial<IPageHasId & {isTarget?: boolean, processData?: IPageOperationProcessData}>;

export const UserGroupPageGrantStatus = {
  isGranted: 'isGranted',
  notGranted: 'notGranted',
  cannotGrant: 'cannotGrant',
};
type UserGroupPageGrantStatus = typeof UserGroupPageGrantStatus[keyof typeof UserGroupPageGrantStatus];
export type GroupGrantData = {
  userRelatedGroups: {
    id: string,
    name: string,
    type: GroupType,
    provider?: ExternalGroupProviderType,
    status: UserGroupPageGrantStatus,
  }[],
  nonUserRelatedGrantedGroups: {
    id: string,
    name: string,
    type: GroupType,
    provider?: ExternalGroupProviderType,
  }[],
}
export type IPageGrantData = {
  grant: PageGrant,
  groupGrantData?: GroupGrantData,
}

export type IDeleteSinglePageApiv1Result = {
  ok: boolean
  path: string,
  isRecursively: Nullable<true>,
  isCompletely: Nullable<true>,
};

export type IDeleteManyPageApiv3Result = {
  paths: string[],
  isRecursively: Nullable<true>,
  isCompletely: Nullable<true>,
};

export type IOptionsForUpdate = {
  origin?: Origin
  grant?: PageGrant,
  userRelatedGrantUserGroupIds?: IGrantedGroup[],
  // isSyncRevisionToHackmd?: boolean,
  overwriteScopesOfDescendants?: boolean,
};

export type IOptionsForCreate = {
  grant?: PageGrant,
  grantUserGroupIds?: IGrantedGroup[],
  overwriteScopesOfDescendants?: boolean,

  origin?: Origin
  wip?: boolean,
};
