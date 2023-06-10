import assert from 'assert';

import ldap from 'ldapjs';

import loggerFactory from '~/utils/logger';

import { configManager } from './config-manager';


const logger = loggerFactory('growi:service:ldap-service');

// @types/ldapjs is outdated, and SearchResultEntry does not exist.
// Declare it manually in the meantime.
export interface SearchResultEntry extends Omit<ldap.SearchEntry, 'attributes'> {
  attributes: {
    type: string,
    values: string | string[]
  }[]
}

/**
 * Service to connect to LDAP server.
 * User auth using LDAP is done with PassportService, not here.
*/
class LdapService {

  username?: string; // Necessary when bind type is user bind

  password?: string; // Necessary when bind type is user bind

  constructor(username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }

  /**
   * Execute search on LDAP server and return result
   * @param {string} filter Search filter
   * @param {string} base Base DN to execute search on
   * @returns {SearchEntry[]} Search result. Default scope is set to 'sub'.
   */
  search(filter?: string, base?: string, scope: 'sub' | 'base' | 'one' = 'sub'): Promise<SearchResultEntry[]> {
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
      ? bindDN.replace(/{{username}}/, this.username)
      : bindDN;
    const fixedBindCredentials = (isUserBind) ? this.password : bindCredentials;

    const client = ldap.createClient({
      url,
    });

    client.bind(fixedBindDN, fixedBindCredentials, (err) => {
      assert.ifError(err);
    });

    const searchResults: SearchResultEntry[] = [];

    return new Promise((resolve, reject) => {
      client.search(base || searchBase, { scope, filter }, (err, res) => {
        if (err != null) {
          reject(err);
        }

        // @types/ldapjs is outdated, and pojo property (type SearchResultEntry) does not exist.
        // Typecast to manually declared SearchResultEntry in the meantime.
        res.on('searchEntry', (entry: any) => {
          const pojo = entry?.pojo as SearchResultEntry;
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

  searchGroupDir(): Promise<SearchResultEntry[]> {
    const groupSearchBase = configManager?.getConfig('crowi', 'external-user-group:ldap:groupSearchBase')
    || configManager?.getConfig('crowi', 'security:passport-ldap:groupSearchBase');

    return this.search(undefined, groupSearchBase);
  }

}

export default LdapService;
