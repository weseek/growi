import { configManager } from '~/server/service/config-manager';
import LdapService, { SearchResultEntry } from '~/server/service/ldap';
import PassportService from '~/server/service/passport';
import loggerFactory from '~/utils/logger';
import { batchProcessPromiseAll } from '~/utils/promise';

import {
  ExternalGroupProviderType, ExternalUserGroupTreeNode, ExternalUserInfo, LdapGroupMembershipAttributeType,
} from '../../interfaces/external-user-group';

import ExternalUserGroupSyncService from './external-user-group-sync';

const logger = loggerFactory('growi:service:ldap-user-sync-service');

// When d = max depth of group trees
// Max space complexity of generateExternalUserGroupTrees will be:
// O(TREES_BATCH_SIZE * d * USERS_BATCH_SIZE)
const TREES_BATCH_SIZE = 10;
const USERS_BATCH_SIZE = 30;

class LdapUserGroupSyncService extends ExternalUserGroupSyncService {

  passportService: PassportService;

  ldapService: LdapService;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(passportService, userBindUsername?: string, userBindPassword?: string) {
    super(ExternalGroupProviderType.ldap, 'ldap');
    this.passportService = passportService;
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
      await this.ldapService.bind();
      groupEntries = await this.ldapService.searchGroupDir();
    }
    catch (e) {
      logger.error(e.message);
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

      const userInfos = (await batchProcessPromiseAll(userIds, USERS_BATCH_SIZE, (id) => {
        return this.getUserInfo(id);
      })).filter((info): info is NonNullable<ExternalUserInfo> => info != null);
      const name = this.ldapService.getStringValFromSearchResultEntry(entry, groupNameAttribute);
      const description = this.ldapService.getStringValFromSearchResultEntry(entry, groupDescriptionAttribute);
      const childGroupDNs = getChildGroupDnsFromGroupEntry(entry);

      const childGroupNodesWithNull: (ExternalUserGroupTreeNode | null)[] = [];
      // Do not use Promise.all, because the number of promises processed can
      // exponentially grow when group tree is enormous
      for await (const dn of childGroupDNs) {
        const childEntry = groupEntries.find(ge => ge.objectName === dn);
        childGroupNodesWithNull.push(childEntry != null ? await convert(childEntry, converted) : null);
      }
      const childGroupNodes: ExternalUserGroupTreeNode[] = childGroupNodesWithNull
        .filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);

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

    return (await batchProcessPromiseAll(rootEntries, TREES_BATCH_SIZE, entry => convert(entry, [])))
      .filter((node): node is NonNullable<ExternalUserGroupTreeNode> => node != null);
  }

  private async getUserInfo(userId: string): Promise<ExternalUserInfo | null> {
    const groupMembershipAttributeType = configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttributeType');
    const attrMapUsername = this.passportService.getLdapAttrNameMappedToUsername();
    const attrMapName = this.passportService.getLdapAttrNameMappedToName();
    const attrMapMail = this.passportService.getLdapAttrNameMappedToMail();

    // get full user info from LDAP server using externalUserInfo (DN or UID)
    const getUserEntries = async() => {
      if (groupMembershipAttributeType === LdapGroupMembershipAttributeType.dn) {
        return this.ldapService.search(undefined, userId, 'base');
      }
      if (groupMembershipAttributeType === LdapGroupMembershipAttributeType.uid) {
        return this.ldapService.search(`(uid=${userId})`, undefined);
      }
    };

    let userEntries: SearchResultEntry[] | undefined;
    try {
      userEntries = await getUserEntries();
    }
    catch (e) {
      logger.error(e.message);
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
          username: usernameToBeRegistered,
          name: nameToBeRegistered,
          email: mailToBeRegistered,
        } : null;
      }
    }
    return null;
  }

}

export default LdapUserGroupSyncService;
