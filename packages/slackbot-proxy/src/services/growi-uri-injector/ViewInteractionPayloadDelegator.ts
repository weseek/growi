import { Service } from '@tsed/di';
import {
  GrowiUriInjector, GrowiUriWithOriginalData, isGrowiUriWithOriginalData, ViewElement, ViewInteractionPayload,
} from '~/interfaces/growi-uri-injector';

@Service()
export class ViewInteractionPayloadDelegator implements GrowiUriInjector<ViewElement, ViewInteractionPayload> {

  shouldHandleToInject(data: ViewElement): boolean {
    return data != null;
  }

  inject(data: ViewElement, growiUri :string): void {
    const originalData = data.private_metadata;

    const urlWithOrgData: GrowiUriWithOriginalData = { growiUri, originalData };

    data.private_metadata = JSON.stringify(urlWithOrgData);
  }

  shouldHandleToExtract(data: ViewInteractionPayload): boolean {
    const { type, view } = data;
    if (type !== 'view_submission') {
      return false;
    }

    try {
      const restoredData: any = JSON.parse(view.private_metadata);
      return isGrowiUriWithOriginalData(restoredData);
    }
    // when parsing failed
    catch (err) {
      return false;
    }
  }

  extract(data: ViewInteractionPayload): GrowiUriWithOriginalData {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const restoredData: GrowiUriWithOriginalData = JSON.parse(data.view.private_metadata!); // private_metadata must not be null at this moment
    data.view.private_metadata = restoredData.originalData;

    return restoredData;
  }

}
