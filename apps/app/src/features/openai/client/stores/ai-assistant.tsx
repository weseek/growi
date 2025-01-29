import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

export const AiAssistantManegementModalPageMode = {
  HOME: 'home',
  INSTRUCTION: 'instruction',
} as const;

type AiAssistantManegementModalPageMode = typeof AiAssistantManegementModalPageMode[keyof typeof AiAssistantManegementModalPageMode];

type AiAssistantManegementModalStatus = {
  isOpened: boolean,
  pageMode?: AiAssistantManegementModalPageMode,
}

type AiAssistantManegementModalUtils = {
  open(): void
  close(): void
  changePageMode(pageType: AiAssistantManegementModalPageMode): void
}

export const useAiAssistantManegementModal = (
    status?: AiAssistantManegementModalStatus,
): SWRResponse<AiAssistantManegementModalStatus, Error> & AiAssistantManegementModalUtils => {
  const initialStatus = { isOpened: false, pageType: AiAssistantManegementModalPageMode.HOME };
  const swrResponse = useSWRStatic<AiAssistantManegementModalStatus, Error>('AiAssistantManegementModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback(() => { swrResponse.mutate({ isOpened: true }) }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
    changePageMode: useCallback((pageMode: AiAssistantManegementModalPageMode) => {
      swrResponse.mutate({ isOpened: swrResponse.data?.isOpened ?? false, pageMode });
    }, [swrResponse]),
  };
};
