import { useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { useAtomCallback } from 'jotai/utils';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useShareLinkId } from '~/stores-universal/context';

import { currentPageIdAtom, currentPageDataAtom } from './internal-atoms';


/**
 * Simplified page fetching hook using Jotai + SWR
 * Replaces the complex useSWRMUTxCurrentPage with cleaner state management
 */
export const useFetchCurrentPage = (): {
  fetchCurrentPage: () => Promise<IPagePopulatedToShowRevision | null>,
  isLoading: boolean,
  error: Error | null,
} => {
  const { data: shareLinkId } = useShareLinkId();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentPage = useAtomCallback(
    useCallback(async(get, set) => {
      const currentPageId = get(currentPageIdAtom);

      if (!currentPageId) return null;

      // Get URL parameter for specific revisionId
      let revisionId: string | undefined;
      if (isClient()) {
        const urlParams = new URLSearchParams(window.location.search);
        const requestRevisionId = urlParams.get('revisionId');
        revisionId = requestRevisionId != null ? requestRevisionId : undefined;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiv3Get<{ page: IPagePopulatedToShowRevision }>(
          '/page',
          { pageId: currentPageId, shareLinkId, revisionId },
        );

        const newData = response.data.page;
        set(currentPageDataAtom, newData);

        return newData;
      }
      catch (err) {
        // TODO: Handle error properly
        // ref: https://redmine.weseek.co.jp/issues/169797
        setError(new Error('Failed to fetch current page'));
        return null;
      }
      finally {
        setIsLoading(false);
      }
    }, [shareLinkId]),
  );

  return { fetchCurrentPage, isLoading, error };

};
