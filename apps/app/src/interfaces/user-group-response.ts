import { HasObjectId, Ref } from '@growi/core';

import { IPageHasId } from './page';
import {
  IUserHasId, IUserGroup, IUserGroupHasId, IUserGroupRelationHasId,
} from './user';

export type UserGroupResult = {
  userGroup: IUserGroupHasId,
}

export type UserGroupListResult = {
  userGroups: IUserGroupHasId[],
};

export type ChildUserGroupListResult<TUSERGROUP = IUserGroupHasId> = {
  childUserGroups: TUSERGROUP[],
  grandChildUserGroups: TUSERGROUP[],
};

export type UserGroupRelationListResult<TUSERGROUPRELATION = IUserGroupRelationHasId> = {
  userGroupRelations: TUSERGROUPRELATION[],
};

export type IUserGroupRelationHasIdPopulatedUser<TUSERGROUP = IUserGroup> = {
  relatedGroup: Ref<TUSERGROUP>,
  relatedUser: IUserHasId,
  createdAt: Date,
} & HasObjectId;

export type UserGroupRelationsResult = {
  userGroupRelations: IUserGroupRelationHasIdPopulatedUser[],
};

export type UserGroupPagesResult = {
  pages: IPageHasId[],
}

export type SelectableParentUserGroupsResult = {
  selectableParentGroups: IUserGroupHasId[],
}

export type SelectableUserChildGroupsResult = {
  selectableChildGroups: IUserGroupHasId[],
}

export type AncestorUserGroupsResult = {
  ancestorUserGroups: IUserGroupHasId[],
}
