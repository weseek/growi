export interface LDAPGroupSyncSettings {
  ldapGroupsDN: string
  ldapGroupMembershipAttribute: string
  ldapGroupMembershipAttributeType: string
  ldapGroupChildGroupAttribute: string
  autoGenerateUserOnLDAPGroupSync: boolean
  preserveDeletedLDAPGroups: boolean
  ldapGroupNameAttribute: string
  ldapGroupDescriptionAttribute?: string
}
