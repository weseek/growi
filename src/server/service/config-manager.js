const ConfigLoader = require('../service/config-loader')
  , debug = require('debug')('growi:service:ConfigManager');

class ConfigManager {

  constructor(configModel) {
    this.configModel = configModel;
    this.configLoader = new ConfigLoader(this.configModel);
    this.configObject = null;
  }

  async loadConfigs() {
    this.configObject = await this.configLoader.load();

    debug('ConfigManager#loadConfigs', this.configObject);
  }

  getConfig(namespace, key) {
    return this.defaultSearch(namespace, key);
  }

  defaultSearch(namespace, key) {
    if (this.configObject.fromDB[namespace][key] !== undefined) {
      return this.configObject.fromDB[namespace][key];
    }
    else {
      return this.configObject.fromEnvVars[namespace][key];
    }
  }

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
