import { useCallback } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useShareLinkId } from '~/stores-universal/context';

import {
  currentPageIdAtom, currentPageDataAtom, pageNotFoundAtom, pageNotCreatableAtom,
  pageLoadingAtom, pageErrorAtom,
} from './internal-atoms';

// API parameter types for better type safety
interface PageApiParams {
  pageId?: string;
  path?: string;
  shareLinkId?: string;
  revisionId?: string;
}


/**
 * Simplified page fetching hook using Jotai state management
 * All state is managed through atoms for consistent global state
 */
export const useFetchCurrentPage = (): {
  fetchCurrentPage: (currentPathname?: string) => Promise<IPagePopulatedToShowRevision | null>,
  isLoading: boolean,
  error: Error | null,
} => {
  const { data: shareLinkId } = useShareLinkId();

  // Use atoms for state instead of local state
  const isLoading = useAtomValue(pageLoadingAtom);
  const error = useAtomValue(pageErrorAtom);

  const fetchCurrentPage = useAtomCallback(
    useCallback(async(get, set, currentPathname?: string) => {
      const currentPath = currentPathname || (isClient() ? decodeURIComponent(window.location.pathname) : '');

      const currentPageId = get(currentPageIdAtom);

      // Get URL parameter for specific revisionId - only when needed
      const revisionId = isClient() && window.location.search
        ? new URLSearchParams(window.location.search).get('revisionId') || undefined
        : undefined;

      set(pageLoadingAtom, true);
      set(pageErrorAtom, null);

      try {
        // Build API parameters with type safety
        const apiParams: PageApiParams = {
          ...(shareLinkId && { shareLinkId }),
          ...(revisionId && { revisionId }),
        };

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
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        const errorMsg = error.message.toLowerCase();

        // Handle specific error types with batch updates
        if (errorMsg.includes('not found') || errorMsg.includes('404')) {
          set(pageNotFoundAtom, true);
          set(currentPageDataAtom, undefined);

          if (currentPath) {
            set(pageNotCreatableAtom, !isCreatablePage(currentPath));
          }
          return null;
        }

        if (errorMsg.includes('forbidden') || errorMsg.includes('403')) {
          set(pageNotFoundAtom, false);
          set(pageNotCreatableAtom, true);
          set(currentPageDataAtom, undefined);
          return null;
        }

        set(pageErrorAtom, new Error(`Failed to fetch current page: ${error.message}`));
        return null;
      }
      finally {
        set(pageLoadingAtom, false);
      }
    }, [shareLinkId]),
  );

  return { fetchCurrentPage, isLoading, error };

};
