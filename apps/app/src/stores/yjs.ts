import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import { type SWRResponse } from 'swr';

export type CurrentPageYjsDataStates = {
  hasDraft?: boolean,
  awarenessStateSize?: number,
}

type CurrentPageYjsDataUtils = {
  updateHasDraft(hasYjsDraft: boolean): void
  updateAwarenessStateSize(awarenessStateSize: number): void
}

export const useCurrentPageYjsData = (): SWRResponse<CurrentPageYjsDataStates, Error> & CurrentPageYjsDataUtils => {
  const swrResponse = useSWRStatic<CurrentPageYjsDataStates, Error>('currentPageYjsData', undefined);

  const updateHasDraft = useCallback((hasDraft: boolean) => {
    swrResponse.mutate({ ...swrResponse.data, hasDraft });
  }, [swrResponse]);

  const updateAwarenessStateSize = useCallback((awarenessStateSize: number) => {
    swrResponse.mutate({ ...swrResponse.data, awarenessStateSize });
  }, [swrResponse]);

  return { ...swrResponse, updateHasDraft, updateAwarenessStateSize };
};
