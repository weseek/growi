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

  search(filter?: string, base?: string): Promise<ldap.SearchEntry[]> {
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
    const searchFilter = configManager?.getConfig('crowi', 'security:passport-ldap:searchFilter') || '(uid={{username}})';

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

    const client = ldap.createClient({
      url,
    });

    client.bind(bindDN, bindCredentials, (err) => {
      assert.ifError(err);
    });

    const searchResults: ldap.SearchEntry[] = [];

    return new Promise((resolve, reject) => {
      client.search(base || searchBase, { scope: 'sub', filter }, (err, res) => {
        if (err != null) {
          reject(err);
        }

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

  searchGroup(): Promise<ldap.SearchEntry[]> {
    const { configManager } = this.crowi;

    const groupSearchBase = configManager?.getConfig('crowi', 'external-user-group:ldap:groupSearchBase')
    || configManager?.getConfig('crowi', 'security:passport-ldap:groupSearchBase');

    return this.search(undefined, groupSearchBase);
  }

}

export default LdapService;
