/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionModalDelegator implements GrowiUriInjector {


  inject(body: any, growiUri:string): void {
    if (body.view == null) {
      return;
    }
    const parsedView = JSON.parse(body.view as string);
    parsedView.private_metadata = JSON.stringify({ growiUri });
    body.view = JSON.stringify(parsedView);
  }

  extract(body: any): string|void {
    const payload = JSON.parse(body.payload);
    if (payload?.view?.private_metadata == null) {
      return;
    }
    return JSON.parse(payload.view.private_metadata).growiUri;
  }

}
