import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

export const AiAssistantManagementModalPageMode = {
  HOME: 'home',
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
