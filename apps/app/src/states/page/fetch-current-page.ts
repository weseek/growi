import { useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { isPermalink } from '@growi/core/dist/utils/page-path-utils';
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
      let currentPageId = get(currentPageIdAtom);

      // Get current path - prefer provided pathname, fallback to URL
      const currentPath = currentPathname
        || (isClient() ? decodeURIComponent(window.location.pathname) : '');

      // Validate pageId against current URL to prevent fetching wrong page on browser back/forward
      if (currentPageId) {
        const expectedPageId = isPermalink(currentPath) ? removeHeadingSlash(currentPath) : null;

        // If we have a pageId but it doesn't match the current URL, clear it
        if (expectedPageId && currentPageId !== expectedPageId) {
          currentPageId = expectedPageId;
          set(currentPageIdAtom, currentPageId);
        }
        // If current path is not a permalink but we have a pageId, it's likely a mismatch
        else if (!expectedPageId && isPermalink(`/${currentPageId}`)) {
          // Current URL is path-based but we have a pageId from previous navigation
          currentPageId = undefined;
          set(currentPageIdAtom, undefined);
        }
      }

      // If no pageId in atom, try to extract from current path
      if (!currentPageId && currentPath) {
        if (isPermalink(currentPath)) {
          currentPageId = removeHeadingSlash(currentPath);
          // Update the atom with the extracted pageId
          set(currentPageIdAtom, currentPageId);
        }
      }

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
        // Build API parameters - prefer pageId if available, fallback to path
        const apiParams: { pageId?: string; path?: string; shareLinkId?: string; revisionId?: string } = { shareLinkId };

        if (currentPageId) {
          apiParams.pageId = currentPageId;
        }
        else if (currentPath) {
          // For path-based navigation when pageId is not available
          // Use the provided/decoded path to avoid double encoding
          apiParams.path = currentPath;
        }
        else {
          // No pageId and no path, cannot proceed
          return null;
        }

        if (revisionId) {
          apiParams.revisionId = revisionId;
        }

        const response = await apiv3Get<{ page: IPagePopulatedToShowRevision }>(
          '/page',
          apiParams,
        );

        const newData = response.data.page;
        set(currentPageDataAtom, newData);

        // Update pageId atom if we got the page data (important for path-based navigation)
        if (newData?._id && newData._id !== currentPageId) {
          set(currentPageIdAtom, newData._id);
        }

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
            if (currentPath) {
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
