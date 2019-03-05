const debug = require('debug')('growi:service:ConfigManager');
const pathUtils = require('@commons/util/path-utils');
const ConfigLoader = require('../service/config-loader');

const KEYS_FOR_SAML_USE_ONLY_ENV_OPTION = [
  'security:passport-saml:isEnabled',
  'security:passport-saml:entryPoint',
  'security:passport-saml:issuer',
  'security:passport-saml:attrMapId',
  'security:passport-saml:attrMapUsername',
  'security:passport-saml:attrMapMail',
  'security:passport-saml:attrMapFirstName',
  'security:passport-saml:attrMapLastName',
  'security:passport-saml:cert'
];

class ConfigManager {

  constructor(configModel) {
    this.configModel = configModel;
    this.configLoader = new ConfigLoader(this.configModel);
    this.configObject = null;
  }

  /**
   * load configs from the database and the environment variables
   */
  async loadConfigs() {
    this.configObject = await this.configLoader.load();

    debug('ConfigManager#loadConfigs', this.configObject);
  }

  /**
   * get a config specified by namespace & key
   *
   * Basically, this searches a specified config from configs loaded from the database at first
   * and then from configs loaded from the environment variables.
   *
   * In some case, this search method changes.
   *
   * the followings are the meanings of each special return value.
   * - null:      a specified config is not set.
   * - undefined: a specified config does not exist.
   */
  getConfig(namespace, key) {
    if (this.searchOnlyFromEnvVarConfigs('crowi', 'security:passport-saml:useOnlyEnvVarsForSomeOptions')) {
      return this.searchInSAMLUseOnlyEnvMode(namespace, key);
    }

    return this.defaultSearch(namespace, key);
  }

  /**
   * get a config specified by namespace & key from configs loaded from the database
   *
   * **Do not use this unless absolutely necessary. Use getConfig instead.**
   */
  getConfigFromDB(namespace, key) {
    return this.searchOnlyFromDBConfigs(namespace, key);
  }

  /**
   * get a config specified by namespace & key from configs loaded from the environment variables
   *
   * **Do not use this unless absolutely necessary. Use getConfig instead.**
   */
  getConfigFromEnvVars(namespace, key) {
    return this.searchOnlyFromEnvVarConfigs(namespace, key);
  }

  /**
   * get the site url
   *
   * If the config for the site url is not set, this returns a message "[The site URL is not set. Please set it!]".
   *
   * With version 3.2.3 and below, there is no config for the site URL, so the system always uses auto-generated site URL.
   * With version 3.2.4 to 3.3.4, the system uses the auto-generated site URL only if the config is not set.
   * With version 3.3.5 and above, the system use only a value from the config.
   */
  getSiteUrl() {
    const siteUrl = this.getConfig('crowi', 'app:siteUrl');
    if (siteUrl != null) {
      return pathUtils.removeTrailingSlash(siteUrl);
    }
    else {
      return '[The site URL is not set. Please set it!]';
    }
  }

  /**
   * update configs in the same namespace
   *
   * Specified values are encoded by convertInsertValue.
   * In it, an empty string is converted to null that indicates a config is not set.
   *
   * For example:
   * ```
   *  updateConfigsInTheSameNamespace(
   *   'some namespace',
   *   {
   *    'some key 1': 'value 1',
   *    'some key 2': 'value 2',
   *    ...
   *   }
   *  );
   * ```
   */
  async updateConfigsInTheSameNamespace(namespace, configs) {
    let queries = [];
    for (const key of Object.keys(configs)) {
      queries.push({
        updateOne: {
          filter: { ns: namespace, key: key },
          update: { ns: namespace, key: key, value: this.convertInsertValue(configs[key]) },
          upsert: true
        }
      });
    }
    await this.configModel.bulkWrite(queries);

    await this.loadConfigs();
  }

  /*
   * All of the methods below are private APIs.
   */

  /**
   * search a specified config from configs loaded from the database at first
   * and then from configs loaded from the environment variables
   */
  defaultSearch(namespace, key) {
    if (!this.configExistsInDB(namespace, key) && !this.configExistsInEnvVars(namespace, key)) {
      return undefined;
    }

    if (this.configExistsInDB(namespace, key) && !this.configExistsInEnvVars(namespace, key) ) {
      return this.configObject.fromDB[namespace][key];
    }

    if (!this.configExistsInDB(namespace, key) && this.configExistsInEnvVars(namespace, key) ) {
      return this.configObject.fromEnvVars[namespace][key];
    }

    if (this.configExistsInDB(namespace, key) && this.configExistsInEnvVars(namespace, key) ) {
      if (this.configObject.fromDB[namespace][key] !== null) {
        return this.configObject.fromDB[namespace][key];
      }
      else {
        return this.configObject.fromEnvVars[namespace][key];
      }
    }
  }

  /**
   * For the configs specified by KEYS_FOR_SAML_USE_ONLY_ENV_OPTION,
   * this searches only from configs loaded from the environment variables.
   * For the other configs, this searches as the same way to defaultSearch.
   */
  searchInSAMLUseOnlyEnvMode(namespace, key) {
    if (namespace === 'crowi' && KEYS_FOR_SAML_USE_ONLY_ENV_OPTION.includes(key)) {
      return this.searchOnlyFromEnvVarConfigs(namespace, key);
    }
    else {
      return this.defaultSearch(namespace, key);
    }
  }

  /**
   * search a specified config from configs loaded from the database
   */
  searchOnlyFromDBConfigs(namespace, key) {
    if (!this.configExistsInDB(namespace, key)) {
      return undefined;
    }

    return this.configObject.fromDB[namespace][key];
  }

  /**
   * search a specified config from configs loaded from the environment variables
   */
  searchOnlyFromEnvVarConfigs(namespace, key) {
    if (!this.configExistsInEnvVars(namespace, key)) {
      return undefined;
    }

    return this.configObject.fromEnvVars[namespace][key];
  }

  /**
   * check whether a specified config exists in configs loaded from the database
   */
  configExistsInDB(namespace, key) {
    if (this.configObject.fromDB[namespace] === undefined) {
      return false;
    }

    return this.configObject.fromDB[namespace][key] !== undefined;
  }

  /**
   * check whether a specified config exists in configs loaded from the environment variables
   */
  configExistsInEnvVars(namespace, key) {
    if (this.configObject.fromEnvVars[namespace] === undefined) {
      return false;
    }

    return this.configObject.fromEnvVars[namespace][key] !== undefined;
  }

  convertInsertValue(value) {
    return JSON.stringify(value === '' ? null : value);
  }
}

module.exports = ConfigManager;
