import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';


type AiAssistantManegementModalStatus = {
  isOpened: boolean,
}

type AiAssistantManegementModalUtils = {
  open(): void
  close(): void
}

export const useAiAssistantManegementModal = (
    status?: AiAssistantManegementModalStatus,
): SWRResponse<AiAssistantManegementModalStatus, Error> & AiAssistantManegementModalUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useSWRStatic<AiAssistantManegementModalStatus, Error>('AiAssistantManegementModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback(() => {
      swrResponse.mutate({ isOpened: true });
    }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
  };
};
