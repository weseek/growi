import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionButtonDelegator implements GrowiUriInjector {


  inject(body: any): any {
    return body;
  }

  extract(block: any): any {
    return block;
  }

}
