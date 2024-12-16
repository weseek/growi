import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';


type KnowledgeAssistantMoldalStatus = {
  isOpened: boolean,
}

type KnowledgeAssistantUtils = {
  open(): void
  close(): void
}
export const useKnowledgeAssistantModal = (
    status?: KnowledgeAssistantMoldalStatus,
): SWRResponse<KnowledgeAssistantMoldalStatus, Error> & KnowledgeAssistantUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useSWRStatic<KnowledgeAssistantMoldalStatus, Error>('KnowledgeAssistantModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback(() => {
      swrResponse.mutate({ isOpened: true });
    }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
  };
};
