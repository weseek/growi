import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { DelegatorType, factory as GrowiUriInjectorFactory } from '~/services/growi-uri-injector';
import { growiUriInjectionModalDelegator } from '~/services/growi-uri-injector/GrowiUriInjectionModalDelegator';

@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  use(@Req() req: Req & SlackOauthReq, @Res() res: Res, @Next() next: Next): void {

    const payload = JSON.parse(req.body.payload);

    if (payload.view != null) {
      const parsedValues = growiUriInjectionModalDelegator.extract(payload);
      req.growiUri = parsedValues.growiUri;
      payload.view.private_metadata = parsedValues.originalData;
    }
    else {
      // break when uri is found
      for (const type of Object.values(DelegatorType)) {
        const growiUriInjector = GrowiUriInjectorFactory.getDelegator(type);
        const parsedValues = growiUriInjector.extract(payload);
        if (parsedValues.growiUri != null) {
          req.growiUri = parsedValues.growiUri;
          break;
        }
        console.log(22, parsedValues);

      }
    }

    req.body.payload = JSON.stringify(payload);

    return next();
  }

}
