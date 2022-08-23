import { Nullable } from '@growi/core';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';
import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { IEditorSettings } from '~/interfaces/editor-settings';
import { SlackChannels } from '~/interfaces/user-trigger-notification';

import {
  useCurrentUser, useDefaultIndentSize, useIsGuestUser,
} from './context';
import { localStorageMiddleware } from './middlewares/sync-to-storage';
import { useSWRxTagsInfo } from './page';
import { useStaticSWR } from './use-static-swr';


type EditorSettingsOperation = {
  update: (updateData: Partial<IEditorSettings>) => void,
  turnOffAskingBeforeDownloadLargeFiles: () => void,
}

export const useEditorSettings = (): SWRResponse<IEditorSettings, Error> & EditorSettingsOperation => {
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();

  const swrResult = useSWRImmutable<IEditorSettings>(
    isGuestUser ? null : ['/personal-setting/editor-settings', currentUser?.username],
    endpoint => apiv3Get(endpoint).then(result => result.data),
    { use: [localStorageMiddleware] }, // store to localStorage for initialization fastly
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

export const useCurrentIndentSize = (): SWRResponse<number, Error> => {
  const { data: defaultIndentSize } = useDefaultIndentSize();
  return useStaticSWR<number, Error>(
    defaultIndentSize == null ? null : 'currentIndentSize',
    undefined,
    { fallbackData: defaultIndentSize },
  );
};

/*
* Slack Notification
*/
export const useSWRxSlackChannels = (currentPagePath: Nullable<string>): SWRResponse<string[], Error> => {
  const shouldFetch: boolean = currentPagePath != null;
  return useSWR(
    shouldFetch ? ['/pages.updatePost', currentPagePath] : null,
    (endpoint, path) => apiGet(endpoint, { path }).then((response: SlackChannels) => response.updatePost),
    { fallbackData: [''] },
  );
};

export const useIsSlackEnabled = (): SWRResponse<boolean, Error> => {
  return useStaticSWR(
    'isSlackEnabled',
    undefined,
    { fallbackData: false },
  );
};

export type IPageTagsForEditorsOption = {
  sync: (tags?: string[]) => void;
}

export const usePageTagsForEditors = (pageId: Nullable<string>): SWRResponse<string[], Error> & IPageTagsForEditorsOption => {
  const { data: tagsInfoData } = useSWRxTagsInfo(pageId);
  const swrResult = useStaticSWR<string[], Error>('pageTags', undefined);

  return {
    ...swrResult,
    sync: (): void => {
      const { mutate } = swrResult;
      mutate(tagsInfoData?.tags || [], false);
    },
  };
};

export const useIsEnabledUnsavedWarning = (): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isEnabledUnsavedWarning', undefined, { fallbackData: false });
};


const useComponentInstances = (): SWRResponse<{}, Error> => {
  return useStaticSWR(
    'componentInstances',
    undefined,
    { fallbackData: {} },
  );
};

export const registerComponentInstance = (id: string, instance) => {
  const { data: componentInstancesData, mutate: mutateComponentInstances } = useComponentInstances();

  if (instance == null) {
    throw new Error('The specified instance must not be null');
  }

  mutateComponentInstances({...componentInstancesData, [id]: instance});
}

// Get registered React component instance
export const getComponentInstance = (id: string) => {
  const { data: componentInstancesData } = useComponentInstances();

  if(componentInstancesData == null){
    return {}
  }
  return componentInstancesData[id];
}
