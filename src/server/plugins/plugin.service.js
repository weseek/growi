const logger = require('@alias/logger')('growi:plugins:PluginService');
const PluginUtils = require('./plugin-utils');

class PluginService {

  constructor(crowi, app) {
    this.crowi = crowi;
    this.app = app;
    this.pluginUtils = new PluginUtils();
  }

  autoDetectAndLoadPlugins() {
    const isEnabledPlugins = this.crowi.configManager.getConfig('crowi', 'plugin:isEnabledPlugins');

    // import plugins
    if (isEnabledPlugins) {
      logger.debug('Plugins are enabled');
      this.loadPlugins(this.pluginUtils.listPluginNames(this.crowi.rootDir));

      // when dev
      if (this.crowi.node_env === 'development') {
        this.autoDetectAndLoadPluginsForDev();
      }
    }

  }

  autoDetectAndLoadPluginsForDev() {
    if (process.env.PLUGIN_NAMES_TOBE_LOADED !== undefined
      && process.env.PLUGIN_NAMES_TOBE_LOADED.length > 0) {

      const pluginNames = process.env.PLUGIN_NAMES_TOBE_LOADED.split(',');
      logger.debug('[development] loading Plugins', pluginNames);

      // merge and remove duplicates
      if (pluginNames.length > 0) {
        this.crowi.pluginService.loadPlugins(pluginNames);
      }
    }
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
