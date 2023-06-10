import { IUserGroupRelation, Ref } from '@growi/core';

import { IUserGroup } from './user';

export interface IExternalUserGroup extends Omit<IUserGroup, 'parent'> {
  parent: Ref<IExternalUserGroup> | null
  externalID: string // identifier used in external app/server
}

export interface IExternalUserGroupRelation extends Omit<IUserGroupRelation, 'relatedGroup'> {
  relatedGroup: Ref<IExternalUserGroup>
}

export interface LdapGroupSyncSettings {
  ldapGroupSearchBase: string
  ldapGroupMembershipAttribute: string
  ldapGroupMembershipAttributeType: string
  ldapGroupChildGroupAttribute: string
  autoGenerateUserOnLdapGroupSync: boolean
  preserveDeletedLdapGroups: boolean
  ldapGroupNameAttribute: string
  ldapGroupDescriptionAttribute?: string
}
