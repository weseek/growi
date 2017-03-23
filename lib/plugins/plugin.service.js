const debug = require('debug')('crowi:plugins:PluginService');
const path = require('path');
const fs = require('hexo-fs');
const PluginLoaderV2 = require('./plugin-loader-v2.model');

class PluginService {

  constructor(crowi, app) {
    this.crowi = crowi;
    this.app = app;
    this.pluginLoaderV2 = new PluginLoaderV2();
  }

  /**
   * list plugin module names that starts with 'crowi-plugin-'
   * borrowing from: https://github.com/hexojs/hexo/blob/d1db459c92a4765620343b95789361cbbc6414c5/lib/hexo/load_plugins.js#L17
   *
   * @returns
   *
   * @memberOf PluginService
   */
  listPluginNames() {
    var packagePath = path.join(this.crowi.rootDir, 'package.json');
    var pluginDir = this.crowi.pluginDir;

    // Make sure package.json exists
    return fs.exists(packagePath).then(function(exist) {
      if (!exist) return [];

      // Read package.json and find dependencies
      return fs.readFile(packagePath).then(function(content) {
        var json = JSON.parse(content);
        var deps = json.dependencies || {};
        return Object.keys(deps);
      });
    }).filter(function(name) {
      // Ignore plugins whose name is not started with "crowi-"
      if (!/^crowi-plugin-/.test(name)) return false;

      // Make sure the plugin exists
      var pluginPath = path.join(pluginDir, name);
      return fs.exists(pluginPath);
    });
  }

  loadPlugins() {
    let self = this;
    this.listPluginNames()
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
      this.pluginLoaderV2.loadForServer(name, this.crowi, this.app);
      return;
    }
  }
}

module.exports = PluginService;
