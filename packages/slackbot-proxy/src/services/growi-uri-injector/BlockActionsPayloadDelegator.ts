import {
  BlockActionsPayload, BlockElement, GrowiUriInjector, GrowiUriWithOriginalData,
} from '~/interfaces/growi-uri-injector';

export abstract class BlockActionsPayloadDelegator implements GrowiUriInjector<BlockElement[], BlockActionsPayload> {

  correctBlockElementTypes(data: BlockElement[]): string[] {
    return data.flatMap((blockElement) => {
      return blockElement.elements.map(element => element.type);
    });
  }

  abstract shouldHandleToInject(data: BlockElement[]): boolean;

  abstract inject(data: BlockElement[], growiUri: string): void;

  abstract shouldHandleToExtract(data: BlockActionsPayload): boolean;

  abstract extract(data: BlockActionsPayload): GrowiUriWithOriginalData;

}
