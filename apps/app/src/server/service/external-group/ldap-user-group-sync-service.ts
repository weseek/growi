import { IExternalUserGroup, LdapGroup } from '~/interfaces/external-user-group';
import { IUserHasId } from '~/interfaces/user';
import ExternalUserGroup from '~/server/models/external-user-group';
import ExternalUserGroupRelation from '~/server/models/external-user-group-relation';

import { configManager } from '../config-manager';
import ExternalAccountService from '../external-account';
import LdapService, { SearchResultEntry } from '../ldap';

import ExternalUserGroupSyncService from './external-user-group-sync-service';

class LdapUserGroupSyncService {

  ldapGroups: LdapGroup[];

  ldapService: LdapService;

  externalAccountService: ExternalAccountService;

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any, userBindUsername?: string, userBindPassword?: string) {
    this.crowi = crowi;
    this.ldapService = new LdapService(userBindUsername, userBindPassword);
    this.externalAccountService = new ExternalAccountService(crowi);
  }

  async fetchLdapGroups(): Promise<void> {
    const isUserBind = configManager.getConfig('crowi', 'security:passport-ldap:isUserBind');
    const getGroupDirData = async() => {
      if (isUserBind) {
        return this.ldapService.searchGroupDir();
      }
      return this.ldapService.searchGroupDir();
    };

    const groupDirData = await getGroupDirData();

    this.ldapGroups = groupDirData.map(data => this.convertSearchResultEntryToLdapGroup(data))
      .filter((group): group is NonNullable<LdapGroup> => group != null);
  }

  // 全グループ同期メソッド
  syncExternalUserGroups(): void {
    /*
     1. ldapGroupSearchBase を使って LDAP から全てのグループを取得する
         - 設定値を元に LDAPGroup に変換する
     2. 各親グループについて、createUpdateExternalUserGroup を呼び出す
     3. 子についても同様に呼び出し、返却された子グループを親グループと紐付ける
     4. 2, 3 を再起的に行う
     5. preserveDeletedLDAPGroups が false の場合、木探索の過程で見つからなかった ExternalUserGroup は削除する
    */
  }

  /**
   * 1. Create/Update ExternalUserGroup from ldapGroup
   * 2. For every element in ldapGroup.users, call getMemberUser and create an ExternalUserGroupRelation with ExternalUserGroup if it does not have one
   * 3. Retrun ExternalUserGroup
  */
  async createUpdateExternalUserGroup(ldapGroup: LdapGroup, parentId: string): Promise<IExternalUserGroup> {
    const externalUserGroup = await ExternalUserGroup.createGroup(ldapGroup.name, ldapGroup.description, ldapGroup.dn, parentId);

    await Promise.all(ldapGroup.users.map((userIdentifier) => {
      return (async() => {
        const user = await this.getMemberUser(userIdentifier);
        await ExternalUserGroupRelation.findOrCreateRelation(externalUserGroup, user);
      })();
    }));

    return externalUserGroup;
  }

  /**
   * 1. Execute search on LDAP server for user using useridentifier
   * 2. Search for GROWI user based on LDAP user info, and return
   *   - if autoGenerateUserOnLDAPGroupSync is true and GROWI user is not found, create new GROWI user
   * @param {string} userIdentifier Search LDAP server using this identifier (DN or UID)
   * @returns {Promise<IUser | null>} IUser when found or created, null when neither
   */
  async getMemberUser(userIdentifier: string): Promise<IUserHasId | null> {
    const groupMembershipAttributeType = configManager?.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttributeType');

    const getUser = async() => {
      if (groupMembershipAttributeType === 'DN') {
        return this.ldapService.search(undefined, userIdentifier, 'one');
      }
      if (groupMembershipAttributeType === 'UID') {
        return this.ldapService.search(`(uid=${userIdentifier})`, undefined, 'one');
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

  private convertSearchResultEntryToLdapGroup(groupEntry: SearchResultEntry): LdapGroup | null {
    const groupChildGroupAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupChildGroupAttribute');
    const groupMembershipAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupMembershipAttribute');
    const groupNameAttribute = configManager.getConfig('crowi', 'external-user-group:ldap:groupNameAttribute');
    const groupDescriptionAttribute: string = configManager.getConfig('crowi', 'external-user-group:ldap:groupDescriptionAttribute');

    const childGroups = this.ldapService.getArrayValFromSearchResultEntry(groupEntry, groupChildGroupAttribute);
    const users = this.ldapService.getArrayValFromSearchResultEntry(groupEntry, groupMembershipAttribute);

    const name = this.ldapService.getStringValFromSearchResultEntry(groupEntry, groupNameAttribute);
    const description = this.ldapService.getStringValFromSearchResultEntry(groupEntry, groupDescriptionAttribute);

    return name != null ? {
      dn: groupEntry.objectName || '',
      childGroups,
      users,
      name,
      description,
    } : null;
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
