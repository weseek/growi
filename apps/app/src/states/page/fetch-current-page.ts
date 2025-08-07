import { useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { useAtomCallback } from 'jotai/utils';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useShareLinkId } from '~/stores-universal/context';

import {
  currentPageIdAtom, currentPageDataAtom, pageNotFoundAtom, pageNotCreatableAtom,
} from './internal-atoms';


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

        // Reset routing state when page is successfully fetched
        set(pageNotFoundAtom, false);

        return newData;
      }
      catch (err) {
        // Handle page not found errors for same-route navigation
        if (err instanceof Error) {
          const errorMessage = err.message.toLowerCase();

          // Check if it's a 404 or forbidden error
          if (errorMessage.includes('not found') || errorMessage.includes('404')) {
            set(pageNotFoundAtom, true);
            set(pageNotCreatableAtom, false); // Will be determined by path analysis
            set(currentPageDataAtom, undefined);

            // For same route, we need to determine if page is creatable
            // This should match the logic in injectPageDataForInitial
            if (isClient()) {
              const currentPath = window.location.pathname;
              const { pagePathUtils } = await import('@growi/core/dist/utils');
              const isCreatable = pagePathUtils.isCreatablePage(currentPath);
              set(pageNotCreatableAtom, !isCreatable);
            }

            return null;
          }

          if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
            set(pageNotFoundAtom, false);
            set(pageNotCreatableAtom, true); // Forbidden means page exists but not accessible
            set(currentPageDataAtom, undefined);
            return null;
          }
        }

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
