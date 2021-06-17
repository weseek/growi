import loggerFactory from '~/utils/logger';
import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionModalDelegator } from './GrowiUriInjectionModalDelegator';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

const logger = loggerFactory('growi-uri-injector:growiUriInjectorFactory');

type DelegatorType = 'MODAL' | 'BUTTON';

const TypeToDelegatorMappings:{[key in DelegatorType]:GrowiUriInjector} = {
  MODAL: new GrowiUriInjectionModalDelegator(),
  BUTTON: new GrowiUriInjectionButtonDelegator(),
};


/**
 * Instanciate GrowiUriInjector
 */
class GrowiUriInjectorFactory {

  delegator: GrowiUriInjector;

  initializeDelegator(type:DelegatorType) {

    this.delegator = TypeToDelegatorMappings[type];

    if (this.delegator == null) {
      logger.warn('Failed to initialize GrowiUriInjector delegator.');
    }
  }

  getDelegator(type:DelegatorType) {
    if (this.delegator == null) {
      this.initializeDelegator(type);
    }
    return this.delegator;
  }

}

export const factory = new GrowiUriInjectorFactory();
