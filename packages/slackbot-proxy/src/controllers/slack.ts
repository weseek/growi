import {
  BodyParams, Context, Controller, Get, Post, Req, Res,
} from '@tsed/common';

import { InstallProvider } from '@slack/oauth';
import { parse as parseUrl } from 'url';

@Controller('/slack')
export class SlackCtrl {

  installer: InstallProvider;

  constructor() {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const stateSecret = process.env.SLACK_INSTALLPROVIDER_STATE_SECRET;

    if (clientId === undefined) {
      throw new Error('The environment variable \'SLACK_CLIENT_ID\' must be defined.');
    }
    if (clientSecret === undefined) {
      throw new Error('The environment variable \'SLACK_CLIENT_SECRET\' must be defined.');
    }

    this.installer = new InstallProvider({
      clientId,
      clientSecret,
      stateSecret,
    });
  }

  @Post('/events')
  handlewEvent(@BodyParams() body: any, @Res() res: Res): string {
    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    console.log('body', body);

    return 'This action will be handled by bolt service.';
  }

  @Get('/oauth_redirect')
  handleOauthRedirect(@Req() req: Req, @Res() res: Res): void {
    const parsedUrl = parseUrl(req.url, true);
    const code = parsedUrl.query.code as string;
    const state = parsedUrl.query.state as string;

    console.log({ parsedUrl, code, state });

    if (state.length === 0) {
      req.query.state = 'initial';
    }

    const parsedUrl2 = parseUrl(req.url, true);
    const code2 = parsedUrl.query.code as string;
    const state2 = parsedUrl.query.state as string;
    console.log({ parsedUrl2, code2, state2 });

    this.installer.handleCallback(req, res);
    // this.installer.handleCallback(req, res, {
    //   success: (installation, metadata, req, res) => {},
    //   failure: (error, installOptions, req, res) => {},
    // });
  }

}
