const logger = require('@alias/logger')('growi:plugins:PluginService');
const PluginUtils = require('./plugin-utils');

class PluginService {

  constructor(crowi, app) {
    this.crowi = crowi;
    this.app = app;
    this.pluginUtils = new PluginUtils();
  }

  autoDetectAndLoadPlugins() {
    this.loadPlugins(this.pluginUtils.listPluginNames(this.crowi.rootDir));
  }

  /**
   * load plugins
   *
   * @memberOf PluginService
   */
  loadPlugins(pluginNames) {
    pluginNames
      .map((name) => {
        return this.pluginUtils.generatePluginDefinition(name);
      })
      .forEach((definition) => {
        this.loadPlugin(definition);
      });
  }

  loadPlugin(definition) {
    const meta = definition.meta;

    switch (meta.pluginSchemaVersion) {
      // v1 is deprecated
      case 1:
        logger.warn('pluginSchemaVersion 1 is deprecated', definition);
        break;
      // v2 is deprecated
      case 2:
        logger.warn('pluginSchemaVersion 2 is deprecated', definition);
        break;
      case 3:
        logger.info(`load plugin '${definition.name}'`);
        definition.entries.forEach((entryPath) => {
          const entry = require(entryPath);
          entry(this.crowi, this.app);
        });
        break;
      default:
        logger.warn('Unsupported schema version', meta.pluginSchemaVersion);
    }
  }

}

module.exports = PluginService;
