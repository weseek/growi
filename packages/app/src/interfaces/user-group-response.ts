import { IUserGroupHasId, IUserGroupRelationHasId } from './user';
import { IPageHasId } from './page';

export type UserGroupListResult = {
  userGroups: IUserGroupHasId[],
};

export type ChildUserGroupListResult = {
  childUserGroups: IUserGroupHasId[],
  grandChildUserGroups: IUserGroupHasId[],
};

export type UserGroupRelationListResult = {
  userGroupRelations: IUserGroupRelationHasId[],
};

export type UserGroupPagesResult = {
  pages: IPageHasId[],
}

export type SelectableUserGroupsResult = {
  selectableUserGroups: IUserGroupHasId[],
}
