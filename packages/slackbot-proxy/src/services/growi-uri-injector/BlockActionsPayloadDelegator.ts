import { GrowiUriInjector, GrowiUriWithOriginalData, isGrowiUriWithOriginalData } from '~/interfaces/growi-uri-injector';
import { GrowiReq } from '~/interfaces/growi-to-slack/growi-req';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';

export class BlockActionsPayloadDelegator implements GrowiUriInjector<{view: string}, {view: {'private_metadata': string}}> {

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleToInject(req: GrowiReq): boolean {
    return req.body.view != null;
  }

  inject(body: {view: string}, growiUri:string): void {
    const parsedView = JSON.parse(body.view);
    const originalData = JSON.stringify(parsedView.private_metadata);

    const data: GrowiUriWithOriginalData = { growiUri, originalData };

    parsedView.private_metadata = JSON.stringify(data);
    body.view = JSON.stringify(parsedView);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleToExtract(req: Req & SlackOauthReq): boolean {
    const { type, view } = req.parsedPayload;
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
