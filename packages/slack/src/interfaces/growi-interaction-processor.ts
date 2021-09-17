import { AuthorizeResult } from '@slack/oauth';

import { RequestFromSlack } from './request-from-slack';

export interface InteractionHandledResult<V> {
  result: V;
  isTerminate: boolean;
}

export const initializeInteractionHandledResult = (): any => {
  return {
    result: null,
    isTerminate: false,
  };
};

export type HandlerName = string;

export interface GrowiInteractionProcessor<V> {

  shouldHandleInteraction(interactionPayload: any): boolean;

  processInteraction(authorizeResult: AuthorizeResult, interactionPayload: any): Promise<InteractionHandledResult<V>>;

}
