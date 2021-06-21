/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionButtonDelegator implements GrowiUriInjector {

  inject(parsedBlocks: any, growiUri:string): void {
    parsedBlocks.forEach((parsedBlock) => {
      if (parsedBlock.type !== 'actions') {
        return;
      }
      parsedBlock.elements.forEach((element) => {
        // TODO shoud handle method
        if (element.type === 'button') {
          const parsedValue = JSON.parse(element.value as string);
          const originalData = JSON.stringify(parsedValue);
          element.value = JSON.stringify({ growiUri, originalData });
        }
      });
    });
  }

  extract(action: any): {growiUri?:string, originalData:any} {
    const parsedValues = JSON.parse(action.value);
    if (parsedValues.originalData != null) {
      parsedValues.originalData = JSON.parse(parsedValues.originalData);
    }
    return parsedValues;
  }

}

export const growiUriInjectionButtonDelegator = new GrowiUriInjectionButtonDelegator();
