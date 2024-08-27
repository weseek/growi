import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';


type RagPromptMoldalStatus = {
  isOpened: boolean,
}

type RagPromptUtils = {
  open(): void
  close(): void
}
export const useRagPromptModal = (status?: RagPromptMoldalStatus): SWRResponse<RagPromptMoldalStatus, Error> & RagPromptUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useSWRStatic<RagPromptMoldalStatus, Error>('RagPromptModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback(() => {
      swrResponse.mutate({ isOpened: true });
    }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
  };
};
