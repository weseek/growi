const path = require('path');
const fs = require('hexo-fs');

class PluginUtils {

  /**
   * return a array of definition objects that has following structure:
   *
   * [
   *   {
   *     name: 'crowi-plugin-X',
   *     meta: require('crowi-plugin-X'),
   *     entries: [
   *       require('crowi-plugin-X/lib/client-entry')
   *     ]
   *   },
   * ]
   *
   * @param {string} rootDir Crowi Project root dir
   * @return
   * @memberOf PluginService
   */
  generatePluginDefinitions(rootDir, isForClient = false) {
    return this.listPluginNames(rootDir)
      .map((name) => {
        const meta = require(name);
        const entries = (isForClient) ? meta.clientEntries : meta.serverEntries;

        return {
          name: name,
          meta: meta,
          entries: entries.map((entryPath) => {
            return require(entryPath);
          })
        }

      });
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
