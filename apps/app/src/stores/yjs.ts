import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';

import { apiv3Get } from '~/client/util/apiv3-client';
import type { CurrentPageYjsData } from '~/interfaces/yjs';

import { useCurrentPageId } from './page';

type CurrentPageYjsDataUtils = {
  updateHasDraft(hasYjsDraft: boolean): void
  updateHasRevisionBodyDiff(hasRevisionBodyDiff: boolean): void
  updateAwarenessStateSize(awarenessStateSize: number): void
}

export const useCurrentPageYjsData = (): SWRResponse<CurrentPageYjsData, Error> & CurrentPageYjsDataUtils => {
  const swrResponse = useSWRStatic<CurrentPageYjsData, Error>('currentPageYjsData', undefined);

  const updateHasDraft = useCallback((hasYjsDraft: boolean) => {
    swrResponse.mutate({ ...swrResponse.data, hasYjsDraft });
  }, [swrResponse]);

  const updateHasRevisionBodyDiff = useCallback((hasRevisionBodyDiff: boolean) => {
    swrResponse.mutate({ ...swrResponse.data, hasRevisionBodyDiff });
  }, [swrResponse]);

  const updateAwarenessStateSize = useCallback((awarenessStateSize: number) => {
    swrResponse.mutate({ ...swrResponse.data, awarenessStateSize });
  }, [swrResponse]);

  return {
    ...swrResponse, updateHasDraft, updateHasRevisionBodyDiff, updateAwarenessStateSize,
  };
};

export const useSWRMUTxCurrentPageYjsData = (): SWRMutationResponse<CurrentPageYjsData, Error> => {
  const key = 'currentPageYjsData';
  const { data: currentPageId } = useCurrentPageId();

  return useSWRMutation(
    key,
    () => apiv3Get<{ yjsData: CurrentPageYjsData }>(`/page/${currentPageId}/yjs-data`).then(result => result.data.yjsData),
    { populateCache: true, revalidate: false },
  );
};
