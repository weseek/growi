import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

import type { CurrentPageYjsData } from '~/interfaces/yjs';

type CurrentPageYjsDataUtils = {
  updateHasRevisionBodyDiff(hasRevisionBodyDiff: boolean): void
  updateAwarenessStateSize(awarenessStateSize: number): void
}

export const useCurrentPageYjsData = (): SWRResponse<CurrentPageYjsData, Error> & CurrentPageYjsDataUtils => {
  const swrResponse = useSWRStatic<CurrentPageYjsData, Error>('currentPageYjsData', undefined);

  const updateHasRevisionBodyDiff = useCallback((hasRevisionBodyDiff: boolean) => {
    swrResponse.mutate({ ...swrResponse.data, hasRevisionBodyDiff });
  }, [swrResponse]);

  const updateAwarenessStateSize = useCallback((awarenessStateSize: number) => {
    swrResponse.mutate({ ...swrResponse.data, awarenessStateSize });
  }, [swrResponse]);

  return {
    ...swrResponse, updateHasRevisionBodyDiff, updateAwarenessStateSize,
  };
};
