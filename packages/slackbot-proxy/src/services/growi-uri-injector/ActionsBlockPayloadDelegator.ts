import { Inject, OnInit, Service } from '@tsed/di';
import { GrowiReq } from '~/interfaces/growi-to-slack/growi-req';
import {
  BlockActionsPayload, BlockElement, GrowiUriInjector, GrowiUriWithOriginalData,
} from '~/interfaces/growi-uri-injector';
import { ButtonActionPayloadDelegator } from './block-elements/ButtonActionPayloadDelegator';


@Service()
export class ActionsBlockPayloadDelegator implements GrowiUriInjector<BlockElement[], BlockActionsPayload & {actions: any}>, OnInit {

  @Inject()
  buttonActionPayloadDelegator: ButtonActionPayloadDelegator;

  private childDelegators: GrowiUriInjector<any, any>[] = [];

  $onInit(): void | Promise<any> {
    this.childDelegators.push(this.buttonActionPayloadDelegator);
  }

  shouldHandleToInject(req: GrowiReq): boolean {
    return req.body.blocks != null;
  }

  inject(data: BlockElement[], growiUri: string): void {
    const actionsBlocks = data.filter(blockElement => blockElement.type === 'actions');

    // collect elements
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const elements = actionsBlocks.flatMap(actionBlock => actionBlock.elements!);

    this.childDelegators.forEach((delegator) => {
      if (delegator.shouldHandleToInject(elements)) {
        delegator.inject(elements, growiUri);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldHandleToExtract(data: BlockActionsPayload & {actions?: any}): boolean {
    if (data.actions == null || data.actions.length === 0) {
      return false;
    }

    const action = data.actions[0];
    return this.childDelegators
      .map(delegator => delegator.shouldHandleToExtract(action))
      .includes(true);
  }

  extract(data: BlockActionsPayload & {actions: any}): GrowiUriWithOriginalData {
    let growiUriWithOriginalData: GrowiUriWithOriginalData;

    const action = data.actions[0];
    for (const delegator of this.childDelegators) {
      if (delegator.shouldHandleToExtract(action)) {
        growiUriWithOriginalData = delegator.extract(action);
        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return growiUriWithOriginalData!;
  }

}
