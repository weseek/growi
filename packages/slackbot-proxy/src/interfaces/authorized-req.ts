import { AuthorizeResult } from '@slack/oauth';
import { Req } from '@tsed/common';

export type AuthedReq = Req & {
  authorizeResult: AuthorizeResult,
};
