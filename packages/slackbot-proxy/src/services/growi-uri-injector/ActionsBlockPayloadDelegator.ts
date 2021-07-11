import { Inject, OnInit, Service } from '@tsed/di';
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

  shouldHandleToInject(data: BlockElement[]): boolean {
    const actionsBlocks = data.filter(blockElement => blockElement.type === 'actions');
    if (actionsBlocks.length === 0) {
      return false;
    }

    // collect elements
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const elements = actionsBlocks.flatMap(actionBlock => actionBlock.elements!);

    return this.childDelegators
      .map(delegator => delegator.shouldHandleToInject(elements))
      .includes(true);
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

    return this.childDelegators
      .map(delegator => delegator.shouldHandleToExtract(data.actions))
      .includes(true);
  }

  extract(data: BlockActionsPayload & {actions: any}): GrowiUriWithOriginalData {
    let growiUriWithOriginalData: GrowiUriWithOriginalData;

    for (const delegator of this.childDelegators) {
      if (delegator.shouldHandleToExtract(data.actions)) {
        growiUriWithOriginalData = delegator.extract(data.actions);
        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return growiUriWithOriginalData!;
  }

}
