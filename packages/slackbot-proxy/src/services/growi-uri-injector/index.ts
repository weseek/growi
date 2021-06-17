import loggerFactory from '~/utils/logger';
import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionModalDelegator } from './GrowiUriInjectionModalDelegator';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

const logger = loggerFactory('growi-uri-injector:growiUriInjectorFactory');

const TypeToDelegatorMappings = {
  MODAL: GrowiUriInjectionModalDelegator,
  BUTTON: GrowiUriInjectionButtonDelegator,
};

/**
 * Instanciate GrowiUriInjector
 */
class GrowiUriInjectorFactory {

  delegator: GrowiUriInjector;

  initializeDelegator(type:string) {

    this.delegator = TypeToDelegatorMappings[type];

    if (this.delegator == null) {
      logger.warn('Failed to initialize GrowiUriInjector delegator.');
    }
  }

  getDelegator(type) {
    if (this.delegator == null) {
      this.initializeDelegator(type);
    }
    return this.delegator;
  }

}

export const factory = new GrowiUriInjectorFactory();
