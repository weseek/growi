import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

// import { PluginUtilsV4 } from './plugin-utils-v4';

const fs = require('graceful-fs');

const logger = loggerFactory('growi:plugins:plugin-utils');

class PluginUtils {

  /**
   * list plugin module objects
   *  that starts with 'growi-plugin-' or 'crowi-plugin-'
   * borrowing from: https://github.com/hexojs/hexo/blob/d1db459c92a4765620343b95789361cbbc6414c5/lib/hexo/load_plugins.js#L17
   *
   * @returns array of objects
   *   [
   *     { name: 'growi-plugin-...', requiredVersion: '^1.0.0', installedVersion: '1.0.0' },
   *     { name: 'growi-plugin-...', requiredVersion: '^1.0.0', installedVersion: '1.0.0' },
   *     ...
   *   ]
   *
   * @memberOf PluginService
   */
  listPlugins() {
    const packagePath = resolveFromRoot('package.json');

    // Make sure package.json exists
    if (!fs.existsSync(packagePath)) {
      return [];
    }

    // Read package.json and find dependencies
    const content = fs.readFileSync(packagePath);
    const json = JSON.parse(content);
    const deps = json.dependencies || {};

    const pluginNames = Object.keys(deps).filter((name) => {
      return /^@growi\/plugin-/.test(name);
    });

    return pluginNames.map((name) => {
      return {
        name,
        requiredVersion: deps[name],
        installedVersion: this.getVersion(name),
      };
    });
  }

  /**
   * list plugin module names that starts with 'crowi-plugin-'
   *
   * @returns array of plugin names
   *
   * @memberOf PluginService
   */
  listPluginNames() {
    const plugins = this.listPlugins();
    return plugins.map((plugin) => { return plugin.name });
  }

  getVersion(packageName) {
    const packagePath = resolveFromRoot(`../../node_modules/${packageName}/package.json`);

    // Read package.json and find version
    const content = fs.readFileSync(packagePath);
    const json = JSON.parse(content);
    return json.version || '';
  }

}

module.exports = PluginUtils;
export default PluginUtils;
