import { IInteractionPayloadAccessor } from '../interfaces/request-from-slack';


export class InteractionPayloadAccessor implements IInteractionPayloadAccessor {

  private payload: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(payload: any) {
    this.payload = payload;
  }

  firstAction(): any | null {
    const actions = this.payload.actions;

    if (actions != null && actions[0] != null) {
      return actions[0];
    }

    return;
  }

}
