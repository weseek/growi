import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

export const DelegatorType = {
  BUTTON: 'button',
} as const;
export type DelegatorType = typeof DelegatorType[keyof typeof DelegatorType];

const TypeToDelegatorMappings:{[key in DelegatorType]:GrowiUriInjector} = {
  [DelegatorType.BUTTON]: new GrowiUriInjectionButtonDelegator(),
};


/**
 * Instanciate GrowiUriInjector
 */
class GrowiUriInjectorFactory {

  getDelegator(type:DelegatorType) {
    return TypeToDelegatorMappings[type];
  }

}

export const factory = new GrowiUriInjectorFactory();
