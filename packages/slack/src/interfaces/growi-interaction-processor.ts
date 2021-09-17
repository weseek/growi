import { AuthorizeResult } from '@slack/oauth';

import { RequestFromSlack } from './request-from-slack';

export interface InteractionHandledResult<V> {
  result: V;
  isTerminate(): boolean;
}

export interface GrowiInteractionProcessor<V> {

  shouldHandleInteraction(reqFromSlack: RequestFromSlack): boolean;

  processInteraction(authorizeResult: AuthorizeResult, reqFromSlack: RequestFromSlack): Promise<InteractionHandledResult<V>>;

}
