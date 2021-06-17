import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';

@Middleware()
export class ExtractGrowiUriFromReq implements IMiddleware {

  use(@Req() req: Req & SlackOauthReq, @Res() res: Res, @Next() next: Next): void {
    console.log('hoge');
    const payload = JSON.parse(req.body.payload);

    // For Modal, Send request to only one GROWI
    if (payload.view != null) {
      req.growiUri = JSON.parse(payload.view.private_metadata).growiUri;
    }

    next();
  }

}
