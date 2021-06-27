import { GrowiUriInjector, GrowiUriWithOriginalData, isGrowiUriWithOriginalData } from '~/interfaces/growi-to-slack/growi-uri-injector';

export class ViewInteractionPayloadDelegator implements GrowiUriInjector<{view: string}, {view: {'private_metadata': string}}> {

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleToInject(body: any): boolean {
    return body.view != null;
  }

  inject(body: {view: string}, growiUri:string): void {
    const parsedView = JSON.parse(body.view);
    const originalData = JSON.stringify(parsedView.private_metadata);

    const data: GrowiUriWithOriginalData = { growiUri, originalData };

    parsedView.private_metadata = JSON.stringify(data);
    body.view = JSON.stringify(parsedView);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleToExtract(payload: {type: string, view?: any}): boolean {
    const { type, view } = payload;
    if (type !== 'view_submission') {
      return false;
    }

    try {
      const data: any = JSON.parse(view.private_metadata);
      return isGrowiUriWithOriginalData(data);
    }
    // when parsing failed
    catch (err) {
      return false;
    }
  }

  extract(payload: {view: {'private_metadata': string}}): GrowiUriWithOriginalData {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data: GrowiUriWithOriginalData = JSON.parse(payload.view.private_metadata!); // private_metadata must not be null at this moment
    payload.view.private_metadata = JSON.parse(data.originalData);

    return data;
  }

}
