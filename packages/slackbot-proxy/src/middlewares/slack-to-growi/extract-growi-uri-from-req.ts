import {
  IMiddleware, Inject, Middleware, Next, Req, Res,
} from '@tsed/common';

import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { ViewInteractionPayloadDelegator } from '~/services/growi-uri-injector/ViewInteractionPayloadDelegator';
import { ActionsBlockPayloadDelegator } from '~/services/growi-uri-injector/ActionsBlockPayloadDelegator';


@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  @Inject()
  viewInteractionPayloadDelegator: ViewInteractionPayloadDelegator;

  @Inject()
  actionsBlockPayloadDelegator: ActionsBlockPayloadDelegator;

  use(@Req() req: SlackOauthReq, @Res() res: Res, @Next() next: Next): void {

    // There is no payload in the request from slack
    if (req.body.payload == null) {
      return next();
    }

    const parsedPayload = JSON.parse(req.body.payload);

    // iterate
    for (const delegator of [this.viewInteractionPayloadDelegator, this.actionsBlockPayloadDelegator]) {
      if (delegator.shouldHandleToExtract(parsedPayload)) {
        const data = delegator.extract(parsedPayload);
        req.growiUri = data.growiUri;

        // break if growiUri discovered
        break;
      }
    }

    req.body.payload = JSON.stringify(parsedPayload);

    return next();
  }

}
