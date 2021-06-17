/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionButtonDelegator implements GrowiUriInjector {


  inject(body: any, growiUri:string): void {
    if (body.blocks == null) {
      return;
    }
    const parsedBlocks = JSON.parse(body.blocks as string);
    parsedBlocks.forEach((parsedBlock) => {
      if (parsedBlock.type !== 'actions') {
        return;
      }
      parsedBlock.elements.forEach((element) => {
        const parsedValue = JSON.parse(element.value as string);
        parsedValue.growiUri = growiUri;
        element.value = JSON.stringify(parsedValue);
      });
    });

    body.blocks = JSON.stringify(parsedBlocks);
  }

  extract(body: any): string|void {
    const payload = JSON.parse(body.payload);

    if (payload?.actions[0]?.value == null) {
      return;
    }

    const parsedValues = JSON.parse(payload.actions[0]?.value);
    return parsedValues.growiUri;
  }

}
