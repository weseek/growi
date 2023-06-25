import { HasObjectId, Ref } from '@growi/core';

import { IPageHasId } from './page';
import {
  IUser, IUserGroup, IUserGroupHasId, IUserGroupRelationHasId,
} from './user';

export type UserGroupResult = {
  userGroup: IUserGroupHasId,
}

export type UserGroupListResult<TUSERGROUP = IUserGroupHasId> = {
  userGroups: TUSERGROUP[],
};

export type ChildUserGroupListResult<TUSERGROUP = IUserGroupHasId> = {
  childUserGroups: TUSERGROUP[],
  grandChildUserGroups: TUSERGROUP[],
};

export type UserGroupRelationListResult<TUSERGROUPRELATION = IUserGroupRelationHasId> = {
  userGroupRelations: TUSERGROUPRELATION[],
};

export type IUserGroupRelationHasIdPopulatedUser = {
  relatedGroup: Ref<IUserGroup>,
  relatedUser: IUser & HasObjectId,
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
