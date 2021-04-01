import {
  BodyParams, Controller, Get, Post, Req, Res,
} from '@tsed/common';

import { InstallProvider } from '@slack/oauth';

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
    // illegal state
    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    if (req.query.state !== 'init') {
      throw new Error('illegal state');
    }

    this.installer.handleCallback(req, res);

    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    // this.installer.handleCallback(req, res, {
    //   success: (installation, metadata, req, res) => {},
    //   failure: (error, installOptions, req, res) => {},
    // });
  }

}
