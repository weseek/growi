import { ObsoleteGrowiUriInjector } from '~/interfaces/growi-uri-injector';
import { GrowiUriInjectionButtonDelegator } from './GrowiUriInjectionButtonDelegator';

/**
 * Instanciate GrowiUriInjector
 */
export const growiUriInjectorFactory = {
  button: (): ObsoleteGrowiUriInjector => {
    return new GrowiUriInjectionButtonDelegator();
  },
};

export const findInjectorByType = (type:string): null|ObsoleteGrowiUriInjector => {
  if (!Object.keys(growiUriInjectorFactory).includes(type)) {
    return null;
  }
  return growiUriInjectorFactory[type]();
};
