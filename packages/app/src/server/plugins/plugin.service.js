import loggerFactory from '~/utils/logger';

const PluginUtils = require('./plugin-utils');

const logger = loggerFactory('growi:plugins:PluginService');

class PluginService {

  constructor(crowi, app) {
    this.crowi = crowi;
    this.app = app;
    this.pluginUtils = new PluginUtils();
  }

  async autoDetectAndLoadPlugins() {
    const isEnabledPlugins = this.crowi.configManager.getConfig('crowi', 'plugin:isEnabledPlugins');

    // import plugins
    if (isEnabledPlugins) {
      logger.debug('Plugins are enabled');
      return this.loadPlugins(this.pluginUtils.listPluginNames(this.crowi.rootDir));
    }

  }

  /**
   * load plugins
   *
   * @memberOf PluginService
   */
  async loadPlugins(pluginNames) {
    // get definitions
    const definitions = [];
    for (const pluginName of pluginNames) {
      // eslint-disable-next-line no-await-in-loop
      const definition = await this.pluginUtils.generatePluginDefinition(pluginName);
      if (definition != null) {
        this.loadPlugin(definition);
      }
    }
  }

  loadPlugin(definition) {
    const meta = definition.meta;

    switch (meta.pluginSchemaVersion) {
      // v1, v2 and v3 is deprecated
      case 1:
        logger.warn('pluginSchemaVersion 1 is deprecated', definition);
        break;
      case 2:
        logger.warn('pluginSchemaVersion 2 is deprecated', definition);
        break;
      case 3:
        logger.warn('pluginSchemaVersion 3 is deprecated', definition);
        break;
      // v4 or above
      case 4:
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
