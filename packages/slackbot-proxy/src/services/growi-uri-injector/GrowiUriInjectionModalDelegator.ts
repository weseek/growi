/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionModalDelegator implements GrowiUriInjector {


  inject(body: any, growiUri:string): void {
    if (body.view == null) {
      return;
    }
    const parsedView = JSON.parse(body.view as string);
    const originalData = JSON.stringify(parsedView.private_metadata);

    parsedView.private_metadata = JSON.stringify({ growiUri, originalData });
    body.view = JSON.stringify(parsedView);
  }

  extract(payload: any): {growiUri?:string, originalData:{[key:string]:any}} {
    if (payload?.view?.private_metadata == null) {
      return { originalData: {} };
    }
    const parsedValues = JSON.parse(payload.view.private_metadata);
    if (parsedValues.originalData != null) {
      parsedValues.originalData = JSON.parse(parsedValues.originalData);
    }
    return parsedValues;

  }

}

export const growiUriInjectionModalDelegator = new GrowiUriInjectionModalDelegator();
