import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { growiUriInjectorFactory } from '~/services/growi-uri-injector/GrowiUriInjectorFactory';
import { ViewInteractionPayloadDelegator } from '~/services/growi-uri-injector/ViewInteractionPayloadDelegator';

@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  use(@Req() req: Req & SlackOauthReq, @Res() res: Res, @Next() next: Next): void {

    // There is no payload in the request from slack
    if (req.body.payload == null) {
      return next();
    }

    const parsedPayload = JSON.parse(req.body.payload);
    req.parsedPayload = parsedPayload;

    // TODO: iterate with decorator
    const vipd = new ViewInteractionPayloadDelegator();
    if (vipd.shouldHandleToExtract(req)) {
      const data = vipd.extract(req.parsedPayload);
      req.growiUri = data.growiUri;
    }
    else {
      // break when uri is found
      for (const type of Object.keys(growiUriInjectorFactory)) {
        const growiUriInjector = growiUriInjectorFactory[type]();
        const extractedValues = growiUriInjector.extract(parsedPayload.actions[0]);

        if (extractedValues.growiUri != null) {
          req.growiUri = extractedValues.growiUri;
          parsedPayload.actions[0].value = JSON.stringify(extractedValues.originalData);
          break;
        }
      }
    }

    req.body.payload = JSON.stringify(parsedPayload);

    return next();
  }

}
