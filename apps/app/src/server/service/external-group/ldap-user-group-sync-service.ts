import { IExternalUserGroup, LdapGroup } from '~/interfaces/external-user-group';
import { IUser } from '~/interfaces/user';

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

  // // グループ生成/更新メソッド
  // createUpdateExternalUserGroup(ldapGroup: LdapGroup): IExternalUserGroup {
  //   /*
  //    1. ldapGroup を元に ExternalUserGroup を生成/更新する
  //    2. ldapGroup.users を元に ExternalUserGroup に所属していないメンバーについて getMemberUser を呼び出し、返却された各ユーザを ExternalUserGroup に所属させる (ExternalUserGroupRelation を生成する)
  //    4. ExternalUserGroup を返却する
  //   */
  // }

  /**
   * 1. Execute search on LDAP server for user using useridentifier
   * 2. Search for GROWI user based on LDAP user info, and return
   *   - if autoGenerateUserOnLDAPGroupSync is true and GROWI user is not found, create new GROWI user
   * @param {string} userIdentifier Search LDAP server using this identifier (DN or UID)
   * @returns {Promise<IUser | null>} IUser when found or created, null when neither
   */
  async getMemberUser(userIdentifier: string): Promise<IUser | null> {
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
      const uid = this.getStringValFromSearchResultEntry(userEntry, 'uid');
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

    const childGroups = this.getArrayValFromSearchResultEntry(groupEntry, groupChildGroupAttribute);
    const users = this.getArrayValFromSearchResultEntry(groupEntry, groupMembershipAttribute);

    const name = this.getStringValFromSearchResultEntry(groupEntry, groupNameAttribute);
    const description = this.getStringValFromSearchResultEntry(groupEntry, groupDescriptionAttribute);

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
      const usernameToBeRegistered = attrMapUsername === 'uid' ? uid : this.getStringValFromSearchResultEntry(userEntry, attrMapUsername);
      const nameToBeRegistered = this.getStringValFromSearchResultEntry(userEntry, attrMapName);
      const mailToBeRegistered = this.getStringValFromSearchResultEntry(userEntry, attrMapMail);

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

  private getArrayValFromSearchResultEntry(entry: SearchResultEntry, attributeType: string) {
    const values: string | string[] = entry.attributes.find(attribute => attribute.type === attributeType)?.values || [];
    return typeof values === 'string' ? [values] : values;
  }

  private getStringValFromSearchResultEntry(entry: SearchResultEntry, attributeType: string): string | undefined {
    const values: string | string[] | undefined = entry.attributes.find(attribute => attribute.type === attributeType)?.values;
    if (typeof values === 'string' || values == null) {
      return values;
    }
    if (values.length > 0) {
      return values[0];
    }
    return undefined;
  }

}

export default LdapUserGroupSyncService;
