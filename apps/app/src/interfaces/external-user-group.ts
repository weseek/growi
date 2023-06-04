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
