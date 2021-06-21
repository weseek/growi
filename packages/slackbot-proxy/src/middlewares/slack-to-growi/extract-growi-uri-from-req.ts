import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { DelegatorTypes, factory as GrowiUriInjectorFactory } from '~/services/growi-uri-injector';
import { growiUriInjectionModalDelegator } from '~/services/growi-uri-injector/GrowiUriInjectionModalDelegator';

@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  use(@Req() req: Req & SlackOauthReq, @Res() res: Res, @Next() next: Next): void {

    const payload = JSON.parse(req.body.payload);

    // extract for modal
    if (payload.view != null) {
      const extractedValues = growiUriInjectionModalDelegator.extract(payload);
      req.growiUri = extractedValues.growiUri;
      payload.view.private_metadata = extractedValues.originalData;
    }
    else {
      // break when uri is found
      for (const type of Object.values(DelegatorTypes)) {
        const growiUriInjector = GrowiUriInjectorFactory.getDelegator(type);
        const extractedValues = growiUriInjector.extract(payload.actions[0]);

        if (extractedValues.growiUri != null) {
          req.growiUri = extractedValues.growiUri;
          payload.actions[0].value = JSON.stringify(extractedValues.originalData);
          break;
        }
      }
    }

    req.body.payload = JSON.stringify(payload);

    return next();
  }

}
