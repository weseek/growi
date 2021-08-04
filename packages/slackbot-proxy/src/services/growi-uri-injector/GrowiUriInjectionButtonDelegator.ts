import { GrowiUriInjector } from './GrowiUriInjector';

export class GrowiUriInjectionButtonDelegator implements GrowiUriInjector {

  inject(element: {value:string}, growiUri:string): void {
    const parsedValue = JSON.parse(element.value);
    const originalData = JSON.stringify(parsedValue);
    element.value = JSON.stringify({ growiUri, originalData });
  }

  extract(action: {value:string}): {growiUri?:string, originalData:any} {
    const parsedValues = JSON.parse(action.value);
    if (parsedValues.originalData != null) {
      parsedValues.originalData = JSON.parse(parsedValues.originalData);
    }
    return parsedValues;
  }

}
