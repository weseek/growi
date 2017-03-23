const path = require('path');
const fs = require('graceful-fs');

class PluginUtils {

  /**
   * return a definition objects that has following structure:
   *
   * {
   *   name: 'crowi-plugin-X',
   *   meta: require('crowi-plugin-X'),
   *   entries: [
   *     require('crowi-plugin-X/lib/client-entry')
   *   ]
   * }
   *
   * @param {string} pluginName
   * @return
   * @memberOf PluginService
   */
  generatePluginDefinition(pluginName, isForClient = false) {
    const meta = require(pluginName);
    const entries = (isForClient) ? meta.clientEntries : meta.serverEntries;

    return {
      name: pluginName,
      meta: meta,
      entries: entries.map((entryPath) => {
        return require(entryPath);
      })
    }
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
    if (!fs.existsSync(packagePath)) {
      return [];
    }

    // Read package.json and find dependencies
    const content = fs.readFileSync(packagePath);
    const json = JSON.parse(content);
    const deps = json.dependencies || {};
    return Object.keys(deps).filter((name) => {
      // Ignore plugins whose name is not started with "crowi-"
      return /^crowi-plugin-/.test(name);
    });
  }
}

module.exports = PluginUtils
