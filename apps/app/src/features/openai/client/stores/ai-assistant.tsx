import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import { type SWRResponse, mutate, useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';

import { type AccessibleAiAssistantsHasId, type AiAssistantHasId } from '../../interfaces/ai-assistant';
import type { IThreadRelationHasId } from '../../interfaces/thread-relation'; // IThreadHasId を削除

import { useSWRxThreads } from './thread';

export const AiAssistantManagementModalPageMode = {
  HOME: 'home',
  SHARE: 'share',
  PAGES: 'pages',
  INSTRUCTION: 'instruction',
} as const;

type AiAssistantManagementModalPageMode = typeof AiAssistantManagementModalPageMode[keyof typeof AiAssistantManagementModalPageMode];

type AiAssistantManagementModalStatus = {
  isOpened: boolean,
  pageMode?: AiAssistantManagementModalPageMode,
  aiAssistantData?: AiAssistantHasId;
}

type AiAssistantManagementModalUtils = {
  open(aiAssistantData?: AiAssistantHasId): void
  close(): void
  changePageMode(pageType: AiAssistantManagementModalPageMode): void
}

export const useAiAssistantManagementModal = (
    status?: AiAssistantManagementModalStatus,
): SWRResponse<AiAssistantManagementModalStatus, Error> & AiAssistantManagementModalUtils => {
  const initialStatus = { isOpened: false, pageType: AiAssistantManagementModalPageMode.HOME };
  const swrResponse = useSWRStatic<AiAssistantManagementModalStatus, Error>('AiAssistantManagementModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback((aiAssistantData) => { swrResponse.mutate({ isOpened: true, aiAssistantData }) }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false, aiAssistantData: undefined }), [swrResponse]),
    changePageMode: useCallback((pageMode: AiAssistantManagementModalPageMode) => {
      swrResponse.mutate({ isOpened: swrResponse.data?.isOpened ?? false, pageMode, aiAssistantData: swrResponse.data?.aiAssistantData });
    }, [swrResponse]),
  };
};


export const useSWRxAiAssistants = (): SWRResponse<AccessibleAiAssistantsHasId, Error> => {
  return useSWRImmutable<AccessibleAiAssistantsHasId>(
    ['/openai/ai-assistants'],
    ([endpoint]) => apiv3Get(endpoint).then(response => response.data.accessibleAiAssistants),
  );
};


/*
*  useAiAssistantSidebar
*/
type AiAssistantSidebarStatus = {
  isOpened: boolean,
  isEditorAssistant?: boolean,
  aiAssistantData?: AiAssistantHasId,
  threadData?: IThreadRelationHasId,
}

type AiAssistantSidebarUtils = {
  openChat(
    aiAssistantData: AiAssistantHasId,
    threadData?: IThreadRelationHasId,
  ): void
  openEditor(): void
  close(): void
  refreshCurrentThreadData(): Promise<void>
}

export const useAiAssistantSidebar = (
    status?: AiAssistantSidebarStatus,
): SWRResponse<AiAssistantSidebarStatus, Error> & AiAssistantSidebarUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useSWRStatic<AiAssistantSidebarStatus, Error>('AiAssistantSidebar', status, { fallbackData: initialStatus });
  const { cache } = useSWRConfig();

  const refreshCurrentThreadData = useCallback(async() => {
    const { aiAssistantData, threadData } = swrResponse.data ?? {};

    if (aiAssistantData?._id == null || threadData?._id == null) {
      return;
    }

    const threadsCacheKey = ['threads', aiAssistantData._id];
    await mutate(threadsCacheKey);

    // useSWRxThreads を直接呼び出す代わりに cache を使用
    // cache.get のキーは文字列である必要があるため、配列を結合
    const threadsData = cache.get(threadsCacheKey.join(','))?.data as IThreadRelationHasId[] | undefined; // IThread を IThreadRelationHasId に変更

    if (threadsData == null) {
      return;
    }

    const newThreadDataFromServer = threadsData.find(t => t._id === threadData._id);

    if (newThreadDataFromServer != null && swrResponse.data != null) { // swrResponse.data の存在を確認
      swrResponse.mutate({ ...swrResponse.data, threadData: newThreadDataFromServer });
    }
  }, [swrResponse, cache]);

  return {
    ...swrResponse,
    openChat: useCallback(
      (aiAssistantData: AiAssistantHasId, threadData?: IThreadRelationHasId) => {
        swrResponse.mutate({ isOpened: true, aiAssistantData, threadData });
      }, [swrResponse],
    ),
    openEditor: useCallback(
      () => {
        swrResponse.mutate({
          isOpened: true, isEditorAssistant: true, aiAssistantData: undefined, threadData: undefined,
        });
      }, [swrResponse],
    ),
    close: useCallback(
      () => swrResponse.mutate({
        isOpened: false, isEditorAssistant: false, aiAssistantData: undefined, threadData: undefined,
      }), [swrResponse],
    ),
    refreshCurrentThreadData,
  };
};
