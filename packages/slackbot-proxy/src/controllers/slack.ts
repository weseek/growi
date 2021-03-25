import { Controller, Get, Post } from '@tsed/common';

@Controller('/slack')
export class SlackCtrl {

  @Post('/events')
  handlewithBolt(): string {
    return 'This action will be handled by bolt service.';
  }

  @Get('/oauth_redirect')
  handleOauthRedirect(): string {
    // see: https://slack.dev/bolt-js/ja-jp/concepts#authenticating-oauth
    // see: https://slack.dev/node-slack-sdk/oauth#handling-the-oauth-redirect

    // installer.handleCallback(req, res);

    return '';
  }

}
