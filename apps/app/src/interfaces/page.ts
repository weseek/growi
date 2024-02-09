import type {
  GroupType, IGrantedGroup, IPageHasId, Nullable, PageGrant,
} from '@growi/core';

import type { IPageOperationProcessData } from './page-operation';

export {
  isIPageInfoForEntity, isIPageInfoForOperation, isIPageInfoForListing,
} from '@growi/core';

export type IPageForItem = Partial<IPageHasId & {isTarget?: boolean, processData?: IPageOperationProcessData}>;

export type IPageGrantData = {
  grant: PageGrant,
  userRelatedGrantedGroups?: {
    id: string,
    name: string,
    type: GroupType,
  }[]
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
  grant?: PageGrant,
  userRelatedGrantUserGroupIds?: IGrantedGroup[],
  // isSyncRevisionToHackmd?: boolean,
  overwriteScopesOfDescendants?: boolean,
};

export type IOptionsForCreate = {
  grant?: PageGrant,
  grantUserGroupIds?: IGrantedGroup[],
  overwriteScopesOfDescendants?: boolean,
};
