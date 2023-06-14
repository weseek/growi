import { IUserGroupRelation, Ref } from '@growi/core';

import { IUserGroup } from './user';

export interface IExternalUserGroup extends Omit<IUserGroup, 'parent'> {
  parent: Ref<IExternalUserGroup> | null
  externalId: string // identifier used in external app/server
}

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

// interface for objects before they are converted into ExternalUserGroup
export interface LdapGroup {
  dn: string
  users: string[] // DN or UID
  childGroups: string[] // DN
  name: string
  description?: string
}
