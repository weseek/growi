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
    useCallback(async(get, set, args?: FetchPageArgs): Promise<IPagePopulatedToShowRevision | null> => {
      const currentPageId = get(currentPageIdAtom);
      const currentPageData = get(currentPageDataAtom);

      // Process path first to handle permalinks
      let decodedPath: string | undefined;
      if (args?.path != null) {
        try {
          decodedPath = decodeURIComponent(args.path);
        }
        catch (e) {
          decodedPath = args.path;
        }
      }

      // Guard clause to prevent unnecessary fetching
      if (args?.pageId != null && args.pageId === currentPageId) {
        return currentPageData ?? null;
      }
      if (decodedPath != null) {
        if (isPermalink(decodedPath) && removeHeadingSlash(decodedPath) === currentPageId) {
          return currentPageData ?? null;
        }
        if (decodedPath === currentPageData?.path) {
          return currentPageData ?? null;
        }
      }

      set(pageLoadingAtom, true);
      set(pageErrorAtom, null);

      // determine parameters
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
        set(pageLoadingAtom, false);
        return null;
      }

      try {
        const { data } = await apiv3Get<{ page: IPagePopulatedToShowRevision }>('/page', params);
        const { page: newData } = data;

        set(currentPageDataAtom, newData);
        set(currentPageIdAtom, newData._id);
        set(pageNotFoundAtom, false);
        set(pageNotCreatableAtom, false);

        return newData;
      }
      catch (err) {
        set(pageErrorAtom, err as Error);

        const apiError = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (apiError.response?.status === 404) {
          set(pageNotFoundAtom, true);
          if (params.path != null) {
            set(pageNotCreatableAtom, !isCreatablePage(params.path));
          }
        }
      }
      finally {
        set(pageLoadingAtom, false);
      }

      return null;
    }, [shareLinkId]),
  );

  return { fetchCurrentPage, isLoading, error };
};
