import { useCallback } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isClient } from '@growi/core/dist/utils';
import { isCreatablePage, isPermalink } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useShareLinkId } from '~/stores-universal/context';

import {
  currentPageDataAtom, currentPageIdAtom, pageErrorAtom, pageLoadingAtom, pageNotCreatableAtom, pageNotFoundAtom,
} from './internal-atoms';

type FetchPageArgs = {
  path?: string,
  pageId?: string,
  revisionId?: string,
}

/**
 * Simplified page fetching hook using Jotai state management
 * All state is managed through atoms for consistent global state
 */
export const useFetchCurrentPage = (): {
  fetchCurrentPage: (args?: FetchPageArgs) => Promise<IPagePopulatedToShowRevision | null>,
  isLoading: boolean,
  error: Error | null,
} => {
  const { data: shareLinkId } = useShareLinkId();

  // Use atoms for state instead of local state
  const isLoading = useAtomValue(pageLoadingAtom);
  const error = useAtomValue(pageErrorAtom);

  const fetchCurrentPage = useAtomCallback(
    useCallback(async(get, set, args?: FetchPageArgs) => {
      set(pageLoadingAtom, true);
      set(pageErrorAtom, null);

      const currentPageId = get(currentPageIdAtom);

      // determine parameters
      const path = args?.path;
      const pageId = args?.pageId;
      const revisionId = args?.revisionId ?? (isClient() ? new URLSearchParams(window.location.search).get('revisionId') : undefined);

      // params for API
      const params: { path?: string, pageId?: string, revisionId?: string, shareLinkId?: string } = {};
      if (shareLinkId != null) {
        params.shareLinkId = shareLinkId;
      }
      if (revisionId != null) {
        params.revisionId = revisionId;
      }

      // Process path first to handle permalinks
      let decodedPath: string | undefined;
      if (path != null) {
        try {
          decodedPath = decodeURIComponent(path);
        }
        catch (e) {
          decodedPath = path;
        }
      }

      // priority: pageId > permalink > path
      if (pageId != null) {
        params.pageId = pageId;
      }
      else if (decodedPath != null && isPermalink(decodedPath)) {
        params.pageId = removeHeadingSlash(decodedPath);
      }
      else if (decodedPath != null) {
        params.path = decodedPath;
      }
      // if args is empty, get from global state
      else if (currentPageId != null) {
        params.pageId = currentPageId;
      }
      else if (isClient()) {
        try {
          params.path = decodeURIComponent(window.location.pathname);
        }
        catch (e) {
          params.path = window.location.pathname;
        }
      }
      else {
        // TODO: https://github.com/weseek/growi/pull/9118
        // throw new Error('Either path or pageId must be provided when not in a browser environment');
        return null;
      }

      try {
        const { data } = await apiv3Get<{ page: IPagePopulatedToShowRevision }>('/page', params);
        const { page: newData } = data;

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

          if (path != null) {
            set(pageNotCreatableAtom, !isCreatablePage(path));
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
