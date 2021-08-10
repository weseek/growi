import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

import { PluginUtilsV4 } from './plugin-utils-v4';

const fs = require('graceful-fs');

const logger = loggerFactory('growi:plugins:plugin-utils');

const pluginUtilsV4 = new PluginUtilsV4();

class PluginUtils {

  /**
   * return a definition objects that has following structure:
   *
   * {
   *   name: 'growi-plugin-X',
   *   meta: require('growi-plugin-X'),
   *   entries: [
   *     'growi-plugin-X/lib/client-entry'
   *   ]
   * }
   *
   * @param {string} pluginName
   * @return
   * @memberOf PluginService
   */
  async generatePluginDefinition(name, isForClient = false) {
    const meta = require(name);
    let definition;

    switch (meta.pluginSchemaVersion) {
      // v1, v2 and v3 is deprecated
      case 1:
        logger.debug('pluginSchemaVersion 1 is deprecated');
        break;
      case 2:
        logger.debug('pluginSchemaVersion 2 is deprecated');
        break;
      case 3:
        logger.debug('pluginSchemaVersion 3 is deprecated');
        break;
      // v4 or above
      case 4:
        definition = await pluginUtilsV4.generatePluginDefinition(name, isForClient);
        break;
      default:
        logger.warn('Unsupported schema version', meta.pluginSchemaVersion);
    }

    return definition;
  }

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
