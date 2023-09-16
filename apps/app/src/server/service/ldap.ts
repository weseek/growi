import ldap, { NoSuchObjectError } from 'ldapjs';

import loggerFactory from '~/utils/logger';

import { configManager } from './config-manager';


const logger = loggerFactory('growi:service:ldap-service');

// @types/ldapjs is outdated, and SearchResultEntry does not exist.
// Declare it manually in the meantime.
export interface SearchResultEntry {
  objectName: string // DN
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

  client: ldap.Client;

  searchBase: string;

  constructor() {
    const serverUrl = configManager?.getConfig('crowi', 'security:passport-ldap:serverUrl');

    // parse serverUrl
    // see: https://regex101.com/r/0tuYBB/1
    const match = serverUrl.match(/(ldaps?:\/\/[^/]+)\/(.*)?/);
    if (match == null || match.length < 1) {
      const urlInvalidMessage = 'serverUrl is invalid';
      logger.error(urlInvalidMessage);
      throw new Error(urlInvalidMessage);
    }
    const url = match[1];
    this.searchBase = match[2] || '';

    this.client = ldap.createClient({
      url,
    });
  }

  /**
   * Bind to LDAP server.
   * This method is declared independently, so multiple operations can be requested to the LDAP server with a single bind.
   * @param {string} userBindUsername Necessary when bind type is user bind
   * @param {string} userBindPassword Necessary when bind type is user bind
   */
  bind(userBindUsername?: string, userBindPassword?: string): Promise<void> {
    const isLdapEnabled = configManager?.getConfig('crowi', 'security:passport-ldap:isEnabled');
    if (!isLdapEnabled) {
      const notEnabledMessage = 'LDAP is not enabled';
      logger.error(notEnabledMessage);
      throw new Error(notEnabledMessage);
    }

    // get configurations
    const isUserBind = configManager?.getConfig('crowi', 'security:passport-ldap:isUserBind');
    const bindDN = configManager?.getConfig('crowi', 'security:passport-ldap:bindDN');
    const bindCredentials = configManager?.getConfig('crowi', 'security:passport-ldap:bindDNPassword');

    // user bind
    const fixedBindDN = (isUserBind)
      ? bindDN.replace(/{{username}}/, userBindUsername)
      : bindDN;
    const fixedBindCredentials = (isUserBind) ? userBindPassword : bindCredentials;

    return new Promise<void>((resolve, reject) => {
      this.client.bind(fixedBindDN, fixedBindCredentials, (err) => {
        if (err != null) {
          reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Execute search on LDAP server and return result
   * Execution of bind() is necessary before search
   * @param {string} filter Search filter
   * @param {string} base Base DN to execute search on
   * @returns {SearchEntry[]} Search result. Default scope is set to 'sub'.
   */
  search(filter?: string, base?: string, scope: 'sub' | 'base' | 'one' = 'sub'): Promise<SearchResultEntry[]> {
    const searchResults: SearchResultEntry[] = [];

    return new Promise((resolve, reject) => {
      // reject on client connection error (occures when not binded or host is not found)
      this.client.on('error', (err) => {
        reject(err);
      });

      this.client.search(base || this.searchBase, {
        scope, filter, paged: true, sizeLimit: 200,
      }, (err, res) => {
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
          if (err instanceof NoSuchObjectError) {
            resolve([]);
          }
          else {
            reject(err);
          }
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
    return this.search(undefined, this.getGroupSearchBase());
  }

  getArrayValFromSearchResultEntry(entry: SearchResultEntry, attributeType: string): string[] {
    const values: string | string[] = entry.attributes.find(attribute => attribute.type === attributeType)?.values || [];
    return typeof values === 'string' ? [values] : values;
  }

  getStringValFromSearchResultEntry(entry: SearchResultEntry, attributeType: string): string | undefined {
    const values: string | string[] | undefined = entry.attributes.find(attribute => attribute.type === attributeType)?.values;
    if (typeof values === 'string' || values == null) {
      return values;
    }
    if (values.length > 0) {
      return values[0];
    }
    return undefined;
  }

  getGroupSearchBase(): string {
    return configManager?.getConfig('crowi', 'external-user-group:ldap:groupSearchBase')
    || configManager?.getConfig('crowi', 'security:passport-ldap:groupSearchBase');
  }

}

export default LdapService;
