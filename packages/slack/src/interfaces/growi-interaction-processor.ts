import { AuthorizeResult } from '@slack/oauth';
import { InteractionPayloadAccessor } from '../utils/interaction-payload-accessor';


export interface InteractionHandledResult<V> {
  result?: V;
  isTerminated: boolean;
}

export type HandlerName = string;

export interface GrowiInteractionProcessor<V> {

  shouldHandleInteraction(interactionPayloadAccessor: any): boolean;

  processInteraction(
    authorizeResult: AuthorizeResult, interactionPayload: any, interactionPayloadAccessor: InteractionPayloadAccessor): Promise<InteractionHandledResult<V>>;

}
