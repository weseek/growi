import { ExternalGroupProviderType, ExternalUserGroupTreeNode, ExternalUserInfo } from '~/interfaces/external-user-group';

import { configManager } from '../config-manager';
import LdapService, { SearchResultEntry } from '../ldap';

import ExternalUserGroupSyncService from './external-user-group-sync-service';

class LdapUserGroupSyncService extends ExternalUserGroupSyncService {

  ldapService: LdapService;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any, userBindUsername?: string, userBindPassword?: string) {
    super(crowi, ExternalGroupProviderType.ldap, 'ldap');
    this.ldapService = new LdapService(userBindUsername, userBindPassword);
  }

  async generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]> {
    const groupChildGroupAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupChildGroupAttribute');
    const groupMembershipAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttribute');
    const groupNameAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupNameAttribute');
    const groupDescriptionAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupDescriptionAttribute');
    const groupBase: string = this.ldapService.getGroupSearchBase();

    let groupEntries: SearchResultEntry[];
    try {
      groupEntries = await this.ldapService.searchGroupDir();
    }
    catch (e) {
      throw Error('external_user_group.ldap.group_search_failed');
    }

    const getChildGroupDnsFromGroupEntry = (groupEntry: SearchResultEntry) => {
      // groupChildGroupAttribute and groupMembershipAttribute may be the same,
      // so filter values of groupChildGroupAttribute to ones that include groupBase
      return this.ldapService.getArrayValFromSearchResultEntry(groupEntry, groupChildGroupAttribute).filter(attr => attr.includes(groupBase));
    };
    const getUserIdsFromGroupEntry = (groupEntry: SearchResultEntry) => {
      // groupChildGroupAttribute and groupMembershipAttribute may be the same,
      // so filter values of groupMembershipAttribute to ones that does not include groupBase
      return this.ldapService.getArrayValFromSearchResultEntry(groupEntry, groupMembershipAttribute).filter(attr => !attr.includes(groupBase));
    };

    const convert = async(entry: SearchResultEntry, converted: string[]): Promise<ExternalUserGroupTreeNode | null> => {
      if (converted.includes(entry.objectName)) {
        throw Error('external_user_group.ldap.circular_reference');
      }
      converted.push(entry.objectName);

      const userIds = getUserIdsFromGroupEntry(entry);
      const userInfos = (await Promise.all(userIds.map((id) => {
        return this.getUserInfo(id);
      }))).filter((info): info is NonNullable<ExternalUserInfo> => info != null);
      const name = this.ldapService.getStringValFromSearchResultEntry(entry, groupNameAttribute);
      const description = this.ldapService.getStringValFromSearchResultEntry(entry, groupDescriptionAttribute);
      const childGroupDNs = getChildGroupDnsFromGroupEntry(entry);

      const childGroupNodes: ExternalUserGroupTreeNode[] = (await Promise.all(childGroupDNs.map((dn) => {
        const childEntry = groupEntries.find(ge => ge.objectName === dn);
        return childEntry != null ? convert(childEntry, converted) : null;
      }))).filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);

      return name != null ? {
        id: entry.objectName,
        userInfos,
        childGroupNodes,
        name,
        description,
      } : null;
    };

    // all the DNs of groups that are not a root of a tree
    const allChildGroupDNs = new Set(groupEntries.flatMap((entry) => {
      return getChildGroupDnsFromGroupEntry(entry);
    }));

    // root of every tree
    const rootEntries = groupEntries.filter((entry) => {
      return !allChildGroupDNs.has(entry.objectName);
    });

    return (await Promise.all(rootEntries.map(entry => convert(entry, [])))).filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);
  }

  private async getUserInfo(userId: string): Promise<ExternalUserInfo | null> {
    const groupMembershipAttributeType = configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttributeType');
    const attrMapUsername = this.crowi.passportService.getLdapAttrNameMappedToUsername();
    const attrMapName = this.crowi.passportService.getLdapAttrNameMappedToName();
    const attrMapMail = this.crowi.passportService.getLdapAttrNameMappedToMail();

    // get full user info from LDAP server using externalUserInfo (DN or UID)
    const getUserEntries = async() => {
      if (groupMembershipAttributeType === 'DN') {
        return this.ldapService.search(undefined, userId, 'base');
      }
      if (groupMembershipAttributeType === 'UID') {
        return this.ldapService.search(`(uid=${userId})`, undefined);
      }
    };

    let userEntries: SearchResultEntry[] | undefined;
    try {
      userEntries = await getUserEntries();
    }
    catch (e) {
      throw Error('external_user_group.ldap.user_search_failed');
    }

    if (userEntries != null && userEntries.length > 0) {
      const userEntry = userEntries[0];
      const uid = this.ldapService.getStringValFromSearchResultEntry(userEntry, 'uid');
      if (uid != null) {
        const usernameToBeRegistered = attrMapUsername === 'uid' ? uid : this.ldapService.getStringValFromSearchResultEntry(userEntry, attrMapUsername);
        const nameToBeRegistered = this.ldapService.getStringValFromSearchResultEntry(userEntry, attrMapName);
        const mailToBeRegistered = this.ldapService.getStringValFromSearchResultEntry(userEntry, attrMapMail);

        return usernameToBeRegistered != null ? {
          id: uid,
          username: usernameToBeRegistered || '',
          name: nameToBeRegistered || '',
          email: mailToBeRegistered,
        } : null;
      }
    }
    return null;
  }

}

export default LdapUserGroupSyncService;
