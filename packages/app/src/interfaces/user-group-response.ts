import { IPageHasId } from './page';
import { IUserGroupHasId, IUserGroupRelationHasId, IUserGroupRelationHasIdPopulatedUser } from './user';

export type UserGroupResult = {
  userGroup: IUserGroupHasId,
}

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

export const SearchTypes = {
  FORWARD: 'forward',
  PARTIAL: 'partial',
  BACKWORD: 'backword',
} as const;

export type SearchType = typeof SearchTypes[keyof typeof SearchTypes];
