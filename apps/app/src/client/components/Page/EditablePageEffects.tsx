import { usePageUpdatedEffect } from '~/client/services/side-effects/page-updated';
import { useCurrentPageYjsDataEffect } from '~/client/services/side-effects/yjs';

export const EditablePageEffects = (): React.ReactElement => {

  usePageUpdatedEffect();
  useCurrentPageYjsDataEffect();

  return <></>;

};
