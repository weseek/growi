import { useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { isCreatablePage, isPermalink } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';
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
  fetchCurrentPage: (currentPathname?: string) => Promise<IPagePopulatedToShowRevision | null>,
  isLoading: boolean,
  error: Error | null,
} => {
  const { data: shareLinkId } = useShareLinkId();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentPage = useAtomCallback(
    useCallback(async(get, set, currentPathname?: string) => {
      const currentPath = currentPathname || (isClient() ? decodeURIComponent(window.location.pathname) : '');

      // Determine target pageId from current path
      const targetPageId = isPermalink(currentPath) ? removeHeadingSlash(currentPath) : null;
      let currentPageId = get(currentPageIdAtom);

      // Sync pageId with current path - single atomic update
      if (currentPageId !== targetPageId) {
        currentPageId = targetPageId || undefined;
        set(currentPageIdAtom, currentPageId);
      }

      // Get URL parameter for specific revisionId - only when needed
      const revisionId = isClient() && window.location.search
        ? new URLSearchParams(window.location.search).get('revisionId') || undefined
        : undefined;

      setIsLoading(true);
      setError(null);

      try {
        // Build API parameters efficiently
        const apiParams: Record<string, string> = {};

        if (shareLinkId) apiParams.shareLinkId = shareLinkId;
        if (revisionId) apiParams.revisionId = revisionId;

        // Use pageId when available, fallback to path
        if (currentPageId) {
          apiParams.pageId = currentPageId;
        }
        else if (currentPath) {
          apiParams.path = currentPath;
        }
        else {
          return null; // No valid identifier
        }

        const response = await apiv3Get<{ page: IPagePopulatedToShowRevision }>(
          '/page',
          apiParams,
        );

        const newData = response.data.page;

        // Batch atom updates to minimize re-renders
        set(currentPageDataAtom, newData);
        set(pageNotFoundAtom, false);

        // Update pageId atom if data differs from current
        if (newData?._id !== currentPageId) {
          set(currentPageIdAtom, newData?._id);
        }

        return newData;
      }
      catch (err) {
        const errorMsg = err instanceof Error ? err.message.toLowerCase() : '';

        // Handle specific error types with batch updates
        if (errorMsg.includes('not found') || errorMsg.includes('404')) {
          // Batch update for 404 errors
          set(pageNotFoundAtom, true);
          set(currentPageDataAtom, undefined);

          // Determine if page is creatable
          if (currentPath) {
            set(pageNotCreatableAtom, !isCreatablePage(currentPath));
          }
          return null;
        }

        if (errorMsg.includes('forbidden') || errorMsg.includes('403')) {
          // Batch update for 403 errors
          set(pageNotFoundAtom, false);
          set(pageNotCreatableAtom, true);
          set(currentPageDataAtom, undefined);
          return null;
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
