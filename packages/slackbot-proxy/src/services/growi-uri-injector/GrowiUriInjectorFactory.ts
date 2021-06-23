import { GrowiUriInjector } from './GrowiUriInjector';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

/**
 * Instanciate GrowiUriInjector
 */
export const growiUriInjectorFactory = {
  button: (): GrowiUriInjector => {
    return new GrowiUriInjectionButtonDelegator();
  },
};

export const findInjectorByType = (type:string): null|GrowiUriInjector => {
  if (!Object.keys(growiUriInjectorFactory).includes(type)) {
    return null;
  }
  return growiUriInjectorFactory[type]();
};
