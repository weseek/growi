import { RequestFromSlack } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { Req } from '@tsed/common';

export type SlackOauthReq = Req & RequestFromSlack & {
  authorizeResult: AuthorizeResult,
  growiUri?: string,
};
