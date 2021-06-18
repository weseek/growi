/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionModalDelegator implements GrowiUriInjector {


  inject(body: any, growiUri:string): void {
    if (body.view == null) {
      return;
    }
    const parsedView = JSON.parse(body.view as string);
    // const originalPrivateMetadata = JSON.stringify(parsedView.private_metadata);
    const originalData = JSON.stringify({ type: 'view_submission' });

    parsedView.private_metadata = JSON.stringify({ growiUri, originalData });
    body.view = JSON.stringify(parsedView);
  }

  extract(body: any): {growiUri?:string, originalData:{[key:string]:any}} {
    const payload = JSON.parse(body.payload);

    if (payload?.view?.private_metadata == null) {
      return { originalData: {} };
    }
    const parsedPrivateMetadata = JSON.parse(payload.view.private_metadata);
    if (parsedPrivateMetadata.originalData != null) {
      parsedPrivateMetadata.originalData = JSON.parse(parsedPrivateMetadata.originalData);
    }
    return parsedPrivateMetadata;

  }

}
