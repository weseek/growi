import createError from 'http-errors';

import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { BlockKitRequest } from '@growi/slack';

export type RespondReqFromGrowi = Req & BlockKitRequest & {
  // appended by GROWI
  headers:{ 'x-growi-app-site-url'?: string },

  // will be extracted from header
  appSiteUrl: string,
}

@Middleware()
export class AddAppSiteUrlToReq implements IMiddleware {

  use(@Req() req: RespondReqFromGrowi, @Res() res: Res, @Next() next: Next): void {

    const appSiteUrl = req.headers['x-growi-app-site-url'];
    if (appSiteUrl == null) {
      return next(createError(400, 'App site url must exist.'));
    }

    req.appSiteUrl = appSiteUrl;

    next();
  }

}
