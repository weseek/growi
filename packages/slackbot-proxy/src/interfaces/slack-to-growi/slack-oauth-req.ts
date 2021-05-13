import { AuthorizeResult } from '@slack/oauth';
import { Req } from '@tsed/common';

export type SlackOauthReq = Req & {
  authorizeResult: AuthorizeResult,
};
