import { GroupType } from '@growi/core';

import { PageGrant } from '~/interfaces/page';

import { ObjectIdLike } from '../../interfaces/mongoose-utils';

export type IPageForResuming = {
  _id: ObjectIdLike,
  path: string,
  isEmpty: boolean,
  parent?: ObjectIdLike,
  grant?: number,
  grantedUsers?: ObjectIdLike[],
  grantedGroups: {
    type: GroupType,
    item: ObjectIdLike,
  }[],
  descendantCount: number,
  status?: number,
  revision?: ObjectIdLike,
  lastUpdateUser?: ObjectIdLike,
  creator?: ObjectIdLike,
};

export type IUserForResuming = {
  _id: ObjectIdLike,
};

export type IOptionsForUpdate = {
  grant?: PageGrant,
  grantUserGroupIds?: {
    type: GroupType,
    item: ObjectIdLike,
  }[],
  isSyncRevisionToHackmd?: boolean,
  overwriteScopesOfDescendants?: boolean,
};

export type IOptionsForCreate = {
  format?: string,
  grantUserGroupIds?: {
    type: GroupType,
    item: ObjectIdLike,
  }[],
  grant?: PageGrant,
  overwriteScopesOfDescendants?: boolean,
  isSynchronously?: boolean,
};

export type IOptionsForResuming = {
  updateMetadata?: boolean,
  createRedirectPage?: boolean,
  prevDescendantCount?: number,
} & IOptionsForUpdate & IOptionsForCreate;
