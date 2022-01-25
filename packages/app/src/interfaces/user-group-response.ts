import { IUserGroupHasId, IUserGroupRelationHasId } from './user';
import { IPageHasId } from './page';

export type UserGroupListResult = {
  userGroups: IUserGroupHasId[],
};

export type ChildUserGroupListResult = {
  childUserGroups: IUserGroupHasId[],
};

export type UserGroupRelationListResult = {
  userGroupRelations: IUserGroupRelationHasId[],
};

export type UserGroupPagesResult = {
  userGroupPages: IPageHasId[],
}
