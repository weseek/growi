import { AuthorizeResult } from '@slack/oauth';

import { RequestFromSlack } from './request-from-slack';

export interface GrowiInteractionProcessor<V> {

  shouldHandleInteraction(reqFromSlack: RequestFromSlack): boolean;

  processInteraction(authorizeResult: AuthorizeResult, reqFromSlack: RequestFromSlack): Promise<V>;

}
