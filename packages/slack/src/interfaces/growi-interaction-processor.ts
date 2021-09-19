import { AuthorizeResult } from '@slack/oauth';

export interface InteractionHandledResult<V> {
  result: V;
  isTerminated: boolean;
}

export const initialInteractionHandledResult = {
  result: null,
  isTerminated: false,
};

export type HandlerName = string;

export interface GrowiInteractionProcessor<V> {

  shouldHandleInteraction(interactionPayloadAccessor: any): boolean;

  processInteraction(authorizeResult: AuthorizeResult, interactionPayload: any, interactionPayloadAccessor: any): Promise<InteractionHandledResult<V>>;

}
