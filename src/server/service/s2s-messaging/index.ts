import loggerFactory from '~/utils/logger';
import { S2sMessagingService } from './base';

const logger = loggerFactory('growi:service:s2s-messaging:S2sMessagingServiceFactory');

const envToModuleMappings = {
  redis: 'redis',
  nchan: 'nchan',
};

// WIP: Ts.ED code
//
// registerProvider({
//   provide: S2sMessagingService,
//   deps: [ConfigManager],
//   useFactory(configManager: ConfigManager) {
//     const type = configManager.getConfig('crowi', 's2sMessagingPubsub:serverType');

//     if (type == null) {
//       logger.info('Config pub/sub server is not defined.');
//       return;
//     }

//     logger.info(`Config pub/sub server type '${type}' is set.`);

//     const module = envToModuleMappings[type];

//     const modulePath = `./${module}`;
//     this.delegator = require(modulePath)(crowi);

//     if (this.delegator == null) {
//       logger.warn('Failed to initialize config pub/sub delegator.');
//     }
//   },
// })

/**
 * Instanciate server-to-server messaging service
 */
class S2sMessagingServiceFactory {

  delegator!: S2sMessagingService;

  initializeDelegator(crowi) {
    const type = crowi.configManager.getConfig('crowi', 's2sMessagingPubsub:serverType');

    if (type == null) {
      logger.info('Config pub/sub server is not defined.');
      return;
    }

    logger.info(`Config pub/sub server type '${type}' is set.`);

    const module = envToModuleMappings[type];

    const modulePath = `./${module}`;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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

const factory = new S2sMessagingServiceFactory();

module.exports = (crowi) => {
  return factory.getDelegator(crowi);
};
