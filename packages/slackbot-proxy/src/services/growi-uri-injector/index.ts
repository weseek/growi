import loggerFactory from '~/utils/logger';
import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionModalDelegator } from './GrowiUriInjectionModalDelegator';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

const logger = loggerFactory('growi-uri-injector:growiUriInjectorFactory');

export const DelegatorType = {
  MODAL: 'modal',
  BUTTON: 'button',
} as const;
export type DelegatorType = typeof DelegatorType[keyof typeof DelegatorType];

const TypeToDelegatorMappings:{[key in DelegatorType]:GrowiUriInjector} = {
  [DelegatorType.MODAL]: new GrowiUriInjectionModalDelegator(),
  [DelegatorType.BUTTON]: new GrowiUriInjectionButtonDelegator(),
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
