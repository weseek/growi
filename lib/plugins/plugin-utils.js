const path = require('path');
const fs = require('hexo-fs');

class PluginUtils {
  /**
   * return following structure for client:
   *
   * [
   *   'crowi-plugin-X': {
   *     meta: require('crowi-plugin-X'),
   *     entries: [
   *       require('crowi-plugin-X/lib/client-entry')
   *     ]
   *   },
   * ]
   *
   * usage:
   *  1. define at webpack.DefinePlugin
   *  2. retrieve from resource/js/plugin.js
   *
   * @return
   * @memberOf PluginService
   */
  generatePluginDefinitions() {
    // TODO impl
  }

  /**
   * list plugin module names that starts with 'crowi-plugin-'
   * borrowing from: https://github.com/hexojs/hexo/blob/d1db459c92a4765620343b95789361cbbc6414c5/lib/hexo/load_plugins.js#L17
   *
   * @returns
   *
   * @memberOf PluginService
   */
  listPluginNames(rootDir) {
    var packagePath = path.join(rootDir, 'package.json');

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
      return /^crowi-plugin-/.test(name);
    });
  }
}

module.exports = PluginUtils
