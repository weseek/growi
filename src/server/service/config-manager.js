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
   */
  defaultSearch(namespace, key) {
    if (this.configObject.fromDB[namespace][key] !== undefined) {
      return this.configObject.fromDB[namespace][key];
    }
    else {
      return this.configObject.fromEnvVars[namespace][key];
    }
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
