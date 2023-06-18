import { ExternalGroupProviderType, ExternalUserGroupTreeNode } from '~/interfaces/external-user-group';
import { IUserHasId } from '~/interfaces/user';

import { configManager } from '../config-manager';
import ExternalAccountService from '../external-account';
import LdapService, { SearchResultEntry } from '../ldap';

import ExternalUserGroupSyncService from './external-user-group-sync-service';

class LdapUserGroupSyncService extends ExternalUserGroupSyncService {

  ldapService: LdapService;

  externalAccountService: ExternalAccountService;

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any, userBindUsername?: string, userBindPassword?: string) {
    super(ExternalGroupProviderType.ldap);
    this.crowi = crowi;
    this.ldapService = new LdapService(userBindUsername, userBindPassword);
    this.externalAccountService = new ExternalAccountService(crowi);
  }

  async getMemberUser(externalUserId: string): Promise<IUserHasId | null> {
    const groupMembershipAttributeType = configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttributeType');

    const getUser = async() => {
      if (groupMembershipAttributeType === 'DN') {
        return this.ldapService.search(undefined, externalUserId, 'base');
      }
      if (groupMembershipAttributeType === 'UID') {
        return this.ldapService.search(`(uid=${externalUserId})`, undefined);
      }
    };

    const userEntryArr = await getUser();

    if (userEntryArr != null && userEntryArr.length > 0) {
      const userEntry = userEntryArr[0];
      const uid = this.ldapService.getStringValFromSearchResultEntry(userEntry, 'uid');
      if (uid != null) {
        const externalAccount = await this.getExternalAccount(uid, userEntry);
        if (externalAccount != null) {
          return externalAccount.getPopulatedUser();
        }
      }
    }

    return null;
  }

  async generateExternalUserGroupTrees(): Promise<ExternalUserGroupTreeNode[]> {
    const groupChildGroupAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupChildGroupAttribute');
    const groupMembershipAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttribute');
    const groupNameAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupNameAttribute');
    const groupDescriptionAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupDescriptionAttribute');
    const groupBase: string = this.ldapService.getGroupSearchBase();

    const groupEntries = await this.ldapService.searchGroupDir();

    const getChildGroupDnsFromGroupEntry = (groupEntry: SearchResultEntry) => {
      // groupChildGroupAttribute and groupMembershipAttribute may be the same,
      // so filter values of groupChildGroupAttribute to ones that include groupBase
      return this.ldapService.getArrayValFromSearchResultEntry(groupEntry, groupChildGroupAttribute).filter(attr => attr.includes(groupBase));
    };
    const getExternalUserIdsFromGroupEntry = (groupEntry: SearchResultEntry) => {
      // groupChildGroupAttribute and groupMembershipAttribute may be the same,
      // so filter values of groupMembershipAttribute to ones that does not include groupBase
      return this.ldapService.getArrayValFromSearchResultEntry(groupEntry, groupMembershipAttribute).filter(attr => !attr.includes(groupBase));
    };

    const convert = (entry: SearchResultEntry, converted: string[]): ExternalUserGroupTreeNode | null => {
      if (converted.includes(entry.objectName)) {
        throw Error('There is a possible circular reference in your LDAP group tree structure');
      }
      converted.push(entry.objectName);

      const externalUserIds = getExternalUserIdsFromGroupEntry(entry);
      const name = this.ldapService.getStringValFromSearchResultEntry(entry, groupNameAttribute);
      const description = this.ldapService.getStringValFromSearchResultEntry(entry, groupDescriptionAttribute);
      const childGroupDNs = getChildGroupDnsFromGroupEntry(entry);

      const childGroupNodes: ExternalUserGroupTreeNode[] = childGroupDNs.map((dn) => {
        const childEntry = groupEntries.find(ge => ge.objectName === dn);
        return childEntry != null ? convert(childEntry, converted) : null;
      }).filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);

      return name != null ? {
        id: entry.objectName,
        externalUserIds,
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

    return rootEntries.map(entry => convert(entry, [])).filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);
  }

  private async getExternalAccount(uid: string, userEntry: SearchResultEntry) {
    const autoGenerateUserOnLDAPGroupSync = configManager?.getConfig('crowi', 'external-user-group:ldap:autoGenerateUserOnGroupSync');

    if (autoGenerateUserOnLDAPGroupSync) {
      const attrMapUsername = this.crowi.passportService.getLdapAttrNameMappedToUsername();
      const attrMapName = this.crowi.passportService.getLdapAttrNameMappedToName();
      const attrMapMail = this.crowi.passportService.getLdapAttrNameMappedToMail();
      const usernameToBeRegistered = attrMapUsername === 'uid' ? uid : this.ldapService.getStringValFromSearchResultEntry(userEntry, attrMapUsername);
      const nameToBeRegistered = this.ldapService.getStringValFromSearchResultEntry(userEntry, attrMapName);
      const mailToBeRegistered = this.ldapService.getStringValFromSearchResultEntry(userEntry, attrMapMail);

      const userInfo = {
        id: uid,
        username: usernameToBeRegistered,
        name: nameToBeRegistered,
        email: mailToBeRegistered,
      };

      return this.externalAccountService.getOrCreateUser(userInfo, 'ldap');
    }

    return this.crowi.models.ExternalAccount
      .findOne({ providerType: 'ldap', accountId: uid });
  }

}

export default LdapUserGroupSyncService;
