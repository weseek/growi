const logger = require('@alias/logger')('growi:service:ConfigManager');

const parseISO = require('date-fns/parseISO');

const S2sMessage = require('../models/vo/s2s-message');
const S2sMessageHandlable = require('./s2s-messaging/handlable');

const ConfigLoader = require('./config-loader');

const KEYS_FOR_LOCAL_STRATEGY_USE_ONLY_ENV_OPTION = [
  'security:passport-local:isEnabled',
];

const KEYS_FOR_SAML_USE_ONLY_ENV_OPTION = [
  'security:passport-saml:isEnabled',
  'security:passport-saml:entryPoint',
  'security:passport-saml:issuer',
  'security:passport-saml:attrMapId',
  'security:passport-saml:attrMapUsername',
  'security:passport-saml:attrMapMail',
  'security:passport-saml:attrMapFirstName',
  'security:passport-saml:attrMapLastName',
  'security:passport-saml:cert',
  'security:passport-saml:ABLCRule',
];

const KEYS_FOR_FIEL_UPLOAD_USE_ONLY_ENV_OPTION = [
  'app:fileUploadType',
];

const KEYS_FOR_GCS_USE_ONLY_ENV_OPTION = [
  'gcs:apiKeyJsonPath',
  'gcs:bucket',
  'gcs:uploadNamespace',
];

class ConfigManager extends S2sMessageHandlable {

  constructor(configModel) {
    super();

    this.configModel = configModel;
    this.configLoader = new ConfigLoader(this.configModel);
    this.configObject = null;
    this.configKeys = [];
    this.lastLoadedAt = null;

    this.getConfig = this.getConfig.bind(this);
  }

  /**
   * load configs from the database and the environment variables
   */
  async loadConfigs() {
    this.configObject = await this.configLoader.load();
    logger.debug('ConfigManager#loadConfigs', this.configObject);

    // cache all config keys
    this.reloadConfigKeys();

    this.lastLoadedAt = new Date();
  }

  /**
   * Set S2sMessagingServiceDelegator instance
   * @param {S2sMessagingServiceDelegator} s2sMessagingService
   */
  async setS2sMessagingService(s2sMessagingService) {
    this.s2sMessagingService = s2sMessagingService;
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
    let value;

    if (this.shouldSearchedFromEnvVarsOnly(namespace, key)) {
      value = this.searchOnlyFromEnvVarConfigs(namespace, key);
    }
    else {
      value = this.defaultSearch(namespace, key);
    }

    logger.debug(key, value);
    return value;
  }

  /**
   * get a config specified by namespace and regular expression
   */
  getConfigByRegExp(namespace, regexp) {
    const result = {};

    for (const key of this.configKeys) {
      if (regexp.test(key)) {
        result[key] = this.getConfig(namespace, key);
      }
    }

    return result;
  }

  /**
   * get a config specified by namespace and prefix
   */
  getConfigByPrefix(namespace, prefix) {
    const regexp = new RegExp(`^${prefix}`);

    return this.getConfigByRegExp(namespace, regexp);
  }

  /**
   * generate an array of config keys from this.configObject
   */
  getConfigKeys() {
    // type: fromDB, fromEnvVars
    const types = Object.keys(this.configObject);
    let namespaces = [];
    let keys = [];

    for (const type of types) {
      if (this.configObject[type] != null) {
        // ns: crowi, markdown, notification
        namespaces = [...namespaces, ...Object.keys(this.configObject[type])];
      }
    }

    // remove duplicates
    namespaces = [...new Set(namespaces)];

    for (const type of types) {
      for (const ns of namespaces) {
        if (this.configObject[type][ns] != null) {
          keys = [...keys, ...Object.keys(this.configObject[type][ns])];
        }
      }
    }

    // remove duplicates
    keys = [...new Set(keys)];

    return keys;
  }

  reloadConfigKeys() {
    this.configKeys = this.getConfigKeys();
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
  async updateConfigsInTheSameNamespace(namespace, configs, withoutPublishingS2sMessage) {
    const queries = [];
    for (const key of Object.keys(configs)) {
      queries.push({
        updateOne: {
          filter: { ns: namespace, key },
          update: { ns: namespace, key, value: this.convertInsertValue(configs[key]) },
          upsert: true,
        },
      });
    }
    await this.configModel.bulkWrite(queries);

    await this.loadConfigs();

    // publish updated date after reloading
    if (this.s2sMessagingService != null && !withoutPublishingS2sMessage) {
      this.publishUpdateMessage();
    }
  }

  /**
   * return whether the specified namespace/key should be retrieved only from env vars
   */
  shouldSearchedFromEnvVarsOnly(namespace, key) {
    return (namespace === 'crowi' && (
      // local strategy
      (
        KEYS_FOR_LOCAL_STRATEGY_USE_ONLY_ENV_OPTION.includes(key)
        && this.defaultSearch('crowi', 'security:passport-local:useOnlyEnvVarsForSomeOptions')
      )
      // saml strategy
      || (
        KEYS_FOR_SAML_USE_ONLY_ENV_OPTION.includes(key)
        && this.defaultSearch('crowi', 'security:passport-saml:useOnlyEnvVarsForSomeOptions')
      )
      // file upload option
      // [TODO GW-4173] control with the env var gcs:isFileUploadEnvPrioritizes
      || KEYS_FOR_FIEL_UPLOAD_USE_ONLY_ENV_OPTION.includes(key)
      // gcs option
      || (
        KEYS_FOR_GCS_USE_ONLY_ENV_OPTION.includes(key)
        && this.searchOnlyFromEnvVarConfigs('crowi', 'gcs:isGcsEnvPrioritizes')
      )
    ));
  }

  /*
   * All of the methods below are private APIs.
   */

  /**
   * search a specified config from configs loaded from the database at first
   * and then from configs loaded from the environment variables
   */
  defaultSearch(namespace, key) {
    // does not exist neither in db nor in env vars
    if (!this.configExistsInDB(namespace, key) && !this.configExistsInEnvVars(namespace, key)) {
      logger.debug(`${namespace}.${key} does not exist neither in db nor in env vars`);
      return undefined;
    }

    // only exists in db
    if (this.configExistsInDB(namespace, key) && !this.configExistsInEnvVars(namespace, key)) {
      logger.debug(`${namespace}.${key} only exists in db`);
      return this.configObject.fromDB[namespace][key];
    }

    // only exists env vars
    if (!this.configExistsInDB(namespace, key) && this.configExistsInEnvVars(namespace, key)) {
      logger.debug(`${namespace}.${key} only exists in env vars`);
      return this.configObject.fromEnvVars[namespace][key];
    }

    // exists both in db and in env vars [db > env var]
    if (this.configExistsInDB(namespace, key) && this.configExistsInEnvVars(namespace, key)) {
      if (this.configObject.fromDB[namespace][key] !== null) {
        logger.debug(`${namespace}.${key} exists both in db and in env vars. loaded from db`);
        return this.configObject.fromDB[namespace][key];
      }
      /* eslint-disable-next-line no-else-return */
      else {
        logger.debug(`${namespace}.${key} exists both in db and in env vars. loaded from env vars`);
        return this.configObject.fromEnvVars[namespace][key];
      }
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

  async publishUpdateMessage() {
    const s2sMessage = new S2sMessage('configUpdated', { updatedAt: new Date() });

    try {
      await this.s2sMessagingService.publish(s2sMessage);
    }
    catch (e) {
      logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
    }
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'configUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < parseISO(s2sMessage.updatedAt);
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(s2sMessage) {
    logger.info('Reload configs by pubsub notification');
    return this.loadConfigs();
  }

}

module.exports = ConfigManager;
