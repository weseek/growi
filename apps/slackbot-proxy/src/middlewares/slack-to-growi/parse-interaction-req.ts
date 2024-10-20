import type { RequestFromSlack } from '@growi/slack';
import {
  type MiddlewareMethods, Middleware, Next, Req,
} from '@tsed/common';


@Middleware()
export class ParseInteractionPayloadMiddleare implements MiddlewareMethods {

  use(@Req() req: RequestFromSlack, @Next() next: Next): void {

    // There is no payload in the request from slack
    if (req.body.payload == null) {
      return next();
    }

    req.interactionPayload = JSON.parse(req.body.payload);

    return next();
  }

}
