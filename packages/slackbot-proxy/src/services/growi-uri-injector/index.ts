import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

export const DelegatorTypes = {
  BUTTON: 'button',
} as const;
export type DelegatorTypes = typeof DelegatorTypes[keyof typeof DelegatorTypes];

const TypeToDelegatorMappings:{[key in DelegatorTypes]:GrowiUriInjector} = {
  [DelegatorTypes.BUTTON]: new GrowiUriInjectionButtonDelegator(),
};


/**
 * Instanciate GrowiUriInjector
 */
class GrowiUriInjectorFactory {

  getDelegator(type:DelegatorTypes) {
    return TypeToDelegatorMappings[type];
  }

}

export const factory = new GrowiUriInjectorFactory();
