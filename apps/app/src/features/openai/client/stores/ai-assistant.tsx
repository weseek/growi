import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import { type SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';

import { type AccessibleAiAssistantsHasId, type AiAssistantHasId } from '../../interfaces/ai-assistant';

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
}

type AiAssistantManagementModalUtils = {
  open(): void
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
    open: useCallback(() => { swrResponse.mutate({ isOpened: true }) }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
    changePageMode: useCallback((pageMode: AiAssistantManagementModalPageMode) => {
      swrResponse.mutate({ isOpened: swrResponse.data?.isOpened ?? false, pageMode });
    }, [swrResponse]),
  };
};


export const useSWRxAiAssistants = (): SWRResponse<AccessibleAiAssistantsHasId, Error> => {
  return useSWRImmutable<AccessibleAiAssistantsHasId>(
    ['/openai/ai-assistants'],
    ([endpoint]) => apiv3Get(endpoint).then(response => response.data.accessibleAiAssistants),
  );
};


type AiAssistantChatSidebarStatus = {
  isOpened: boolean,
  aiAssistantData?: AiAssistantHasId;
}

type AiAssistantChatSidebarUtils = {
  open(aiAssistantData: AiAssistantHasId): void
  close(): void
}

export const useAiAssistantChatSidebar = (
    status?: AiAssistantChatSidebarStatus,
): SWRResponse<AiAssistantChatSidebarStatus, Error> & AiAssistantChatSidebarUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useSWRStatic<AiAssistantChatSidebarStatus, Error>('AiAssistantChatSidebar', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback((aiAssistantData: AiAssistantHasId) => { swrResponse.mutate({ isOpened: true, aiAssistantData }) }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
  };
};
