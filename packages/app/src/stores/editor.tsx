import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { IEditorSettings } from '~/interfaces/editor-settings';

import { useIsGuestUser } from './context';
import { useStaticSWR } from './use-static-swr';

export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSlackEnabled', isEnabled, { fallbackData: false });
};


type EditorSettingsOperation = {
  update: (updateData: Partial<IEditorSettings>) => void,
  turnOffAskingBeforeDownloadLargeFiles: () => void,
}

export const useEditorSettings = (): SWRResponse<IEditorSettings, Error> & EditorSettingsOperation => {
  const { data: isGuestUser } = useIsGuestUser();

  const swrResult = useSWRImmutable<IEditorSettings>(
    isGuestUser ? null : '/personal-setting/editor-settings',
    endpoint => apiv3Get(endpoint).then(result => result.data),
  );

  return {
    ...swrResult,
    update: (updateData) => {
      const { data, mutate } = swrResult;

      if (data == null) {
        return;
      }

      mutate({ ...data, ...updateData }, false);

      // invoke API
      apiv3Put('/personal-setting/editor-settings', updateData);
    },
    turnOffAskingBeforeDownloadLargeFiles: async() => {
      const { data, mutate } = swrResult;

      if (data == null) {
        return;
      }

      // invoke API
      await apiv3Put('/personal-setting/editor-settings', { textlintSettings: { neverAskBeforeDownloadLargeFiles: true } });
      // revalidate
      mutate();
    },
  };
};

export const useIsTextlintEnabled = (): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isTextlintEnabled', undefined, { fallbackData: false });
};
