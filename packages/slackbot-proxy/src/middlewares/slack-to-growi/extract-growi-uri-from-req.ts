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
      const parsedValues = growiUriInjectionModalDelegator.extract(payload);
      req.growiUri = parsedValues.growiUri;
      payload.view.private_metadata = parsedValues.originalData;
    }
    else {
      // break when uri is found
      for (const type of Object.values(DelegatorTypes)) {
        const growiUriInjector = GrowiUriInjectorFactory.getDelegator(type);
        const parsedValues = growiUriInjector.extract(payload.actions[0]);

        if (parsedValues.growiUri != null) {
          req.growiUri = parsedValues.growiUri;
          payload.actions[0].value = JSON.stringify(parsedValues.originalData);
          break;
        }
      }
    }

    req.body.payload = JSON.stringify(payload);

    return next();
  }

}
