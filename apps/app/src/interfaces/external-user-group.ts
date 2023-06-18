import { HasObjectId, IUserGroupRelation, Ref } from '@growi/core';

import { IUserGroup } from './user';

export const ExternalGroupProviderType = { ldap: 'ldap' } as const;
export type ExternalGroupProviderType = typeof ExternalGroupProviderType[keyof typeof ExternalGroupProviderType];

export interface IExternalUserGroup extends Omit<IUserGroup, 'parent'> {
  parent: Ref<IExternalUserGroup> | null
  externalId: string // identifier used in external app/server
  provider: ExternalGroupProviderType
}

export type IExternalUserGroupHasId = IExternalUserGroup & HasObjectId;

export interface IExternalUserGroupRelation extends Omit<IUserGroupRelation, 'relatedGroup'> {
  relatedGroup: Ref<IExternalUserGroup>
}

export interface LdapGroupSyncSettings {
  ldapGroupSearchBase: string
  ldapGroupMembershipAttribute: string
  ldapGroupMembershipAttributeType: 'DN' | 'UID'
  ldapGroupChildGroupAttribute: string
  autoGenerateUserOnLdapGroupSync: boolean
  preserveDeletedLdapGroups: boolean
  ldapGroupNameAttribute: string
  ldapGroupDescriptionAttribute?: string
}

export type ExternalUserInfo = {
  id: string, // external user id
  username: string,
  name: string,
  email?: string,
}

// Data structure to express the tree structure of external groups, before converting to ExternalUserGroup model
export interface ExternalUserGroupTreeNode {
  id: string
  userInfos: ExternalUserInfo[]
  childGroupNodes: ExternalUserGroupTreeNode[]
  name: string
  description?: string
}
