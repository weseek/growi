const ConfigLoader = require('../service/config-loader')
  , debug = require('debug')('growi:service:ConfigManager');

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
   * Basically, search a specified config from configs loaded from database at first
   * and then from configs loaded from env vars.
   *
   * In some case, this search method changes.(not yet implemented)
   */
  getConfig(namespace, key) {
    return this.defaultSearch(namespace, key);
  }

  /**
   * private api
   *
   * Search a specified config from configs loaded from database at first
   * and then from configs loaded from env vars.
   *
   * the followings are the meanings of each special return value.
   * - null:      a specified config is not set.
   * - undefined: a specified config does not exist.
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
   * check whether a specified config exists in configs loaded from the environment variables
   * @returns {boolean}
   */
  configExistsInEnvVars(namespace, key) {
    if (this.configObject.fromEnvVars[namespace] === undefined) {
      return false;
    }

    return this.configObject.fromEnvVars[namespace][key] !== undefined;
  }

  /**
   * update configs by a iterable object consisting of several objects with ns, key, value fields
   *
   * For example:
   * ```
   *  updateConfigs(
   *   [{
   *     ns:    'some namespace 1',
   *     key:   'some key 1',
   *     value: 'some value 1'
   *   }, {
   *     ns:    'some namespace 2',
   *     key:   'some key 2',
   *     value: 'some value 2'
   *   }]
   *  );
   * ```
   */
  async updateConfigs(configs) {
    for (const config of configs) {
      this.configModel.findOneAndUpdate(
        { ns: config.ns, key: config.key },
        { ns: config.ns, key: config.key, value: JSON.stringify(config.value) },
        { upsert: true, },
        function(err, config) {
          debug('ConfigManager#updateConfigs', err, config);
        });
    }

    await this.loadConfigs();
  }
}

module.exports = ConfigManager;
