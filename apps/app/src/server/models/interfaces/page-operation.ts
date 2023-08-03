import { GrantedGroup } from '@growi/core';

import { PageGrant } from '~/interfaces/page';

import { ObjectIdLike } from '../../interfaces/mongoose-utils';

export type IPageForResuming = {
  _id: ObjectIdLike,
  path: string,
  isEmpty: boolean,
  parent?: ObjectIdLike,
  grant?: number,
  grantedUsers?: ObjectIdLike[],
  grantedGroups: GrantedGroup[],
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
  grantUserGroupIds?: GrantedGroup[],
  isSyncRevisionToHackmd?: boolean,
  overwriteScopesOfDescendants?: boolean,
};

export type IOptionsForCreate = {
  format?: string,
  grantUserGroupIds?: GrantedGroup[],
  grant?: PageGrant,
  overwriteScopesOfDescendants?: boolean,
  isSynchronously?: boolean,
};

export type IOptionsForResuming = {
  updateMetadata?: boolean,
  createRedirectPage?: boolean,
  prevDescendantCount?: number,
} & IOptionsForUpdate & IOptionsForCreate;
