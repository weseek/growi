class ConfigManager {

  constructor(configObject) {
    this.configObject = configObject;
  }

  getConfig(namespace, key) {
    return this.defaultSearch(namespace, key);
  }

  defaultSearch(namespace, key) {
    if (this.configObject['fromDB'][namespace][key] !== undefined) {
      return this.configObject['fromDB'][namespace][key];
    }
    else {
      return this.configObject['fromEnvVars'][namespace][key];
    }
  }
}

module.exports = ConfigManager;
