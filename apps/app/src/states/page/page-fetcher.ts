import { useCallback } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { useAtom } from 'jotai';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useShareLinkId } from '~/stores-universal/context';
import type { AxiosResponse } from '~/utils/axios';

import { currentPageIdAtom, setCurrentPageAtom } from './internal-atoms';

/**
 * Hybrid approach: Use Jotai for state management, SWR for data fetching
 * This eliminates the complex shouldMutate logic while keeping SWR's benefits
 */

const getPageApiErrorHandler = (errs: AxiosResponse[]): IPagePopulatedToShowRevision | null => {
  if (!Array.isArray(errs)) {
    throw Error('error is not array');
  }

  const statusCode = errs[0].status;
  if (statusCode === 403 || statusCode === 404) {
    // for NotFoundPage
    return null;
  }
  throw Error('failed to get page');
};

/**
 * Simplified page fetching hook using Jotai + SWR
 * Replaces the complex useSWRMUTxCurrentPage with cleaner state management
 */
export const usePageFetcher = (): SWRMutationResponse<IPagePopulatedToShowRevision | null, Error> & {
  fetchAndUpdatePage: () => Promise<IPagePopulatedToShowRevision | null>;
} => {
  const [currentPageId] = useAtom(currentPageIdAtom);
  const { data: shareLinkId } = useShareLinkId();
  const setCurrentPage = useAtom(setCurrentPageAtom)[1];

  // Get URL parameter for specific revisionId
  let revisionId: string | undefined;
  if (isClient()) {
    const urlParams = new URLSearchParams(window.location.search);
    const requestRevisionId = urlParams.get('revisionId');
    revisionId = requestRevisionId != null ? requestRevisionId : undefined;
  }

  const key = 'fetchCurrentPage';

  const swrMutationResult = useSWRMutation(
    key,
    async() => {
      if (!currentPageId) {
        return null;
      }

      try {
        const response = await apiv3Get<{ page: IPagePopulatedToShowRevision }>(
          '/page',
          { pageId: currentPageId, shareLinkId, revisionId },
        );

        const newData = response.data.page;

        // Update Jotai state instead of manual SWR cache mutation
        setCurrentPage(newData);

        return newData;
      }
      catch (error) {
        return getPageApiErrorHandler([error]);
      }
    },
    {
      populateCache: false, // We're using Jotai for state, not SWR cache
      revalidate: false,
    },
  );

  const fetchAndUpdatePage = useCallback(async() => {
    const result = await swrMutationResult.trigger();
    return result ?? null;
  }, [swrMutationResult]);

  return {
    ...swrMutationResult,
    fetchAndUpdatePage,
  };
};
