import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';


type RagSearchMoldalStatus = {
  isOpened: boolean,
}

type RagSearchUtils = {
  open(): void
  close(): void
}
export const useRagSearchModal = (status?: RagSearchMoldalStatus): SWRResponse<RagSearchMoldalStatus, Error> & RagSearchUtils => {
  const initialStatus = { isOpened: false };
  const swrResponse = useSWRStatic<RagSearchMoldalStatus, Error>('RagSearchModal', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: useCallback(() => {
      swrResponse.mutate({ isOpened: true });
    }, [swrResponse]),
    close: useCallback(() => swrResponse.mutate({ isOpened: false }), [swrResponse]),
  };
};
