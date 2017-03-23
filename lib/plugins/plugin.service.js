const debug = require('debug')('crowi:plugins:PluginService');
const PluginUtils = require('./plugin-utils');
const PluginLoaderV2 = require('./plugin-loader-v2.model');

class PluginService {

  constructor(crowi, app) {
    this.crowi = crowi;
    this.app = app;
    this.pluginUtils = new PluginUtils();
    this.pluginLoaderV2 = new PluginLoaderV2();
  }

  loadPlugins() {
    let self = this;
    this.pluginUtils.listPluginNames(this.crowi.rootDir)
      .map(function(name) {
        self.loadPlugin(name);
      });
  }

  loadPlugin(name) {
    const meta = require(name);

    // v1 is deprecated
    if (1 === meta.pluginSchemaVersion) {
      debug('pluginSchemaVersion 1 is deprecated');
      return;
    }

    // v2
    if (2 === meta.pluginSchemaVersion) {
      this.pluginLoaderV2.load(name, this.crowi, this.app);
      return;
    }
  }
}

module.exports = PluginService;
