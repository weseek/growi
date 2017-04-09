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
   *     'crowi-plugin-X/lib/client-entry'
   *   ]
   * }
   *
   *
   * @param {string} pluginName
   * @return
   * @memberOf PluginService
   */
  generatePluginDefinition(name, isForClient = false) {
    const meta = require(name);
    const entries = (isForClient) ? meta.clientEntries : meta.serverEntries;

    return {
      name,
      meta,
      entries,
    }
  }

  /**
   * list plugin module objects that starts with 'crowi-plugin-'
   * borrowing from: https://github.com/hexojs/hexo/blob/d1db459c92a4765620343b95789361cbbc6414c5/lib/hexo/load_plugins.js#L17
   *
   * @returns array of objects
   *   [
   *     { name: 'crowi-plugin-...', version: '1.0.0' },
   *     { name: 'crowi-plugin-...', version: '1.0.0' },
   *     ...
   *   ]
   *
   * @memberOf PluginService
   */
  listPlugins(rootDir) {
    var packagePath = path.join(rootDir, 'package.json');

    // Make sure package.json exists
    if (!fs.existsSync(packagePath)) {
      return [];
    }

    // Read package.json and find dependencies
    const content = fs.readFileSync(packagePath);
    const json = JSON.parse(content);
    const deps = json.dependencies || {};

    let objs = {};
    Object.keys(deps).forEach((name) => {
      if (/^crowi-plugin-/.test(name)) {
        objs[name] = deps[name];
      }
    });

    return objs;
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
