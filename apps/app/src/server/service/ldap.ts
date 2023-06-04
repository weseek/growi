import assert from 'assert';

import ldap from 'ldapjs';

import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:service:ldap-service');

/**
 * Service to connect to LDAP server.
 * User auth using LDAP is done with PassportService, not here.
*/
class LdapService {

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Execute search on LDAP server and return result
   * @param {string} username Necessary when bind type is user bind
   * @param {string} password Necessary when bind type is user bind
   * @param {string} filter Search filter
   * @param {string} base Base DN to execute search on
   */
  search(username?: string, password?: string, filter?: string, base?: string): Promise<ldap.SearchEntry[]> {
    const { configManager } = this.crowi;
    const isLdapEnabled = configManager?.getConfig('crowi', 'security:passport-ldap:isEnabled');

    if (!isLdapEnabled) {
      const notEnabledMessage = 'LDAP is not enabled';
      logger.error(notEnabledMessage);
      throw new Error(notEnabledMessage);
    }

    // get configurations
    const isUserBind = configManager?.getConfig('crowi', 'security:passport-ldap:isUserBind');
    const serverUrl = configManager?.getConfig('crowi', 'security:passport-ldap:serverUrl');
    const bindDN = configManager?.getConfig('crowi', 'security:passport-ldap:bindDN');
    const bindCredentials = configManager?.getConfig('crowi', 'security:passport-ldap:bindDNPassword');

    // parse serverUrl
    // see: https://regex101.com/r/0tuYBB/1
    const match = serverUrl.match(/(ldaps?:\/\/[^/]+)\/(.*)?/);
    if (match == null || match.length < 1) {
      const urlInvalidMessage = 'serverUrl is invalid';
      logger.error(urlInvalidMessage);
      throw new Error(urlInvalidMessage);
    }
    const url = match[1];
    const searchBase = match[2] || '';

    // user bind
    const fixedBindDN = (isUserBind)
      ? bindDN.replace(/{{username}}/, username)
      : bindDN;
    const fixedBindCredentials = (isUserBind) ? password : bindCredentials;

    const client = ldap.createClient({
      url,
    });

    client.bind(fixedBindDN, fixedBindCredentials, (err) => {
      assert.ifError(err);
    });

    const searchResults: ldap.SearchEntry[] = [];

    return new Promise((resolve, reject) => {
      client.search(base || searchBase, { scope: 'sub', filter }, (err, res) => {
        if (err != null) {
          reject(err);
        }

        // @types/ldapjs is outdated, and pojo property (type SearchResultEntry) does not exist.
        // Typecast and use SearchEntry in the meantime.
        res.on('searchEntry', (entry: any) => {
          const pojo = entry?.pojo as ldap.SearchEntry;
          searchResults.push(pojo);
        });
        res.on('error', (err) => {
          reject(err);
        });
        res.on('end', (result) => {
          if (result?.status === 0) {
            resolve(searchResults);
          }
          else {
            reject(new Error(`LDAP search failed: status code ${result?.status}`));
          }
        });
      });
    });
  }

  searchGroup(username?: string, password?: string): Promise<ldap.SearchEntry[]> {
    const { configManager } = this.crowi;

    const groupSearchBase = configManager?.getConfig('crowi', 'external-user-group:ldap:groupSearchBase')
    || configManager?.getConfig('crowi', 'security:passport-ldap:groupSearchBase');

    return this.search(username, password, undefined, groupSearchBase);
  }

}

export default LdapService;
