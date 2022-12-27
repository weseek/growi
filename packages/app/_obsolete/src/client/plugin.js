import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:plugin');

export default class GrowiPlugin {

  /**
   * process plugin entry
   *
   * @param {AppContainer} appContainer
   *
   * @memberof CrowiPlugin
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  installAll(appContainer) {
    // import plugin definitions
    let definitions = [];
    try {
      definitions = require('^/tmp/plugins/plugin-definitions');
    }
    catch (e) {
      logger.error('failed to load definitions');
      logger.error(e);
      return;
    }

    definitions.forEach((definition) => {
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
          logger.warn('pluginSchemaVersion 2 is deprecated', definition);
          break;
        case 4:
          definition.entries.forEach((entry) => {
            entry(appContainer);
          });
          break;
        default:
          logger.warn('Unsupported schema version', meta.pluginSchemaVersion);
      }
    });

  }

}

window.growiPlugin = new GrowiPlugin();
