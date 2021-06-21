import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

export const DelegatorTypes = {
  BUTTON: 'button',
} as const;
export type DelegatorTypes = typeof DelegatorTypes[keyof typeof DelegatorTypes];

/**
 * Instanciate GrowiUriInjector
 */
export const growiUriInjectorFactory = {
  [DelegatorTypes.BUTTON]: (): GrowiUriInjector => {
    return new GrowiUriInjectionButtonDelegator();
  },
};
