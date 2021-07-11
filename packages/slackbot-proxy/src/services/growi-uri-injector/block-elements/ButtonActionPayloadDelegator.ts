import { GrowiUriWithOriginalData, GrowiUriInjector } from '~/interfaces/growi-uri-injector';

export class ButtonActionPayloadDelegator implements GrowiUriInjector<{type: string, value: string}[], {type: string, value: string}> {

  shouldHandleToInject(elements: {type: string}[]): boolean {
    const buttonElements = elements.filter(element => element.type === 'button');
    return buttonElements.length > 0;
  }

  inject(elements: {type: string, value: string}[], growiUri: string): void {
    const buttonElements = elements.filter(blockElement => blockElement.type === 'button');

    buttonElements
      .forEach((element) => {
        const urlWithOrgData: GrowiUriWithOriginalData = { growiUri, originalData: element.value };
        element.value = JSON.stringify(urlWithOrgData);
      });
  }

  shouldHandleToExtract(action: {type: string, value: string}): boolean {
    return action.type === 'button';
  }

  extract(action: {type: string, value: string}): GrowiUriWithOriginalData {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const restoredData: GrowiUriWithOriginalData = JSON.parse(action.value);
    action.value = JSON.parse(restoredData.originalData);

    return restoredData;
  }


}
