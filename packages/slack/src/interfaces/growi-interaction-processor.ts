import { AuthorizeResult } from '@slack/oauth';

export interface InteractionHandledResult<V> {
  result?: V;
  isTerminated: boolean;
}

export type HandlerName = string;

export interface GrowiInteractionProcessor<V> {

  shouldHandleInteraction(interactionPayload: any): boolean;

  // TODO: pass reqFromSlack or accessor instead of interactionPayload and use accessor to interact GW-7496
  processInteraction(authorizeResult: AuthorizeResult, interactionPayload: any): Promise<InteractionHandledResult<V>>;

}
