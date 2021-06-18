import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { DelegatorType, factory as GrowiUriInjectorFactory } from '~/services/growi-uri-injector';

@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  use(@Req() req: Req & SlackOauthReq, @Res() res: Res, @Next() next: Next): void {

    // break when uri is found
    for (const type of Object.values(DelegatorType)) {
      const growiUriInjector = GrowiUriInjectorFactory.getDelegator(type);
      const { growiUri } = growiUriInjector.extract(req.body);
      if (growiUri != null) {
        req.growiUri = growiUri;
        break;
      }
    }

    next();
  }

}
