const logger = require('@alias/logger')('growi:service:ConfigPubsubFactory');

const envToModuleMappings = {
  redis:   'redis',
  nchan:   'nchan',
};

class ConfigPubsubFactory {

  initializeDelegator(crowi) {
    const type = crowi.configManager.getConfig('crowi', 'configPubsub:serverType');

    if (type == null) {
      logger.info('Config pub/sub server is not defined.');
      return;
    }

    logger.info(`Config pub/sub server type '${type}' is set.`);

    const module = envToModuleMappings[type];

    const modulePath = `./${module}`;
    this.delegator = require(modulePath)(crowi);

    if (this.delegator == null) {
      logger.warn('Failed to initialize config pub/sub delegator.');
    }
  }

  getDelegator(crowi) {
    if (this.delegator == null) {
      this.initializeDelegator(crowi);
    }
    return this.delegator;
  }

}

const factory = new ConfigPubsubFactory();

module.exports = (crowi) => {
  return factory.getDelegator(crowi);
};
