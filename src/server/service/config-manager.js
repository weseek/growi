const ConfigLoader = require('../service/config-loader')
  , debug = require('debug')('growi:service:ConfigManager');

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
   * update configs in the same namespace
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
    const results = [];
    for (const key in Object.keys(configs)) {
      results.push(
        this.configModel.findOneAndUpdate(
          { ns: namespace, key: key },
          { ns: namespace, key: key, value: JSON.stringify(configs[key]) },
          { upsert: true, }
        ).exec()
      );
    }
    await Promise.all(results);

    await this.loadConfigs();
  }

  /**
   * private api
   *
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
   * private api
   *
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
   * private api
   *
   * search a specified config from configs loaded from the database
   */
  searchOnlyFromDBConfigs(namespace, key) {
    if (!this.configExistsInDB(namespace, key)) {
      return undefined;
    }

    return this.configObject.fromDB[namespace][key];
  }

  /**
   * private api
   *
   * search a specified config from configs loaded from the environment variables
   */
  searchOnlyFromEnvVarConfigs(namespace, key) {
    if (!this.configExistsInEnvVars(namespace, key)) {
      return undefined;
    }

    return this.configObject.fromEnvVars[namespace][key];
  }

  /**
   * private api
   *
   * check whether a specified config exists in configs loaded from the database
   * @returns {boolean}
   */
  configExistsInDB(namespace, key) {
    if (this.configObject.fromDB[namespace] === undefined) {
      return false;
    }

    return this.configObject.fromDB[namespace][key] !== undefined;
  }

  /**
   * private api
   *
   * check whether a specified config exists in configs loaded from the environment variables
   * @returns {boolean}
   */
  configExistsInEnvVars(namespace, key) {
    if (this.configObject.fromEnvVars[namespace] === undefined) {
      return false;
    }

    return this.configObject.fromEnvVars[namespace][key] !== undefined;
  }
}

module.exports = ConfigManager;
