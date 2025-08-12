import { useEffect } from 'react';

import {
  useCurrentPageData, useFetchCurrentPage, useCurrentPageId,
} from '../../states/page';
import { useEditingMarkdown } from '../../stores/editor';

import type { Props, InitialProps, SameRouteEachProps } from './types';

/**
 * Custom hook for handling same-route navigation and fetching page data when needed
 * Handles permalink navigation, path-based navigation, and browser back/forward scenarios
 */
export const useSameRouteNavigation = (
    props: Props,
    extractPageIdFromPathname: (pathname: string) => string | null,
    isInitialProps: (props: Props) => props is (InitialProps & SameRouteEachProps),
): void => {
  const [currentPage] = useCurrentPageData();
  const [pageId, setCurrentPageId] = useCurrentPageId();
  const { fetchCurrentPage } = useFetchCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  // Handle same-route navigation: fetch page data when needed
  useEffect(() => {
    const currentPathname = props.currentPathname;
    const newPageId = extractPageIdFromPathname(currentPathname);
    const skipSSR = isInitialProps(props) ? props.skipSSR : false;

    // Skip if we have initial props with complete data
    if (isInitialProps(props) && !skipSSR) {
      return;
    }

    // Check if current pageId matches the URL (important for browser back/forward)
    const isPageIdMismatch = pageId != null && newPageId != null && pageId !== newPageId;
    const isPathMismatch = pageId != null && newPageId == null && currentPage?.path !== currentPathname;

    // Determine if we need to fetch new page data based on different scenarios:
    const needsFetch = (
      // 1. Permalink navigation with different pageId (includes browser back/forward)
      isPageIdMismatch
      // 2. Path-based navigation mismatch (includes browser back/forward to path-based pages)
      || isPathMismatch
      // 3. Path-based navigation (no pageId) or forced client-side rendering
      || (newPageId == null && !isPathMismatch && (
        // Force fetch if skipSSR is true
        skipSSR
        // Or if we don't have current page data for this path
        || (!currentPage || currentPage.path !== currentPathname)
      ))
    );

    if (needsFetch) {
      const mutatePageData = async() => {
        // Clear old data first to prevent using stale pageId
        if (isPageIdMismatch || isPathMismatch) {
          setCurrentPageId(undefined);
        }

        // Update pageId if we have a new one from permalink
        if (newPageId != null) {
          setCurrentPageId(newPageId);
        }

        // fetchCurrentPage will handle both pageId and path-based navigation
        const pageData = await fetchCurrentPage(currentPathname);
        mutateEditingMarkdown(pageData?.revision?.body);
      };

      mutatePageData();
    }
  // Remove fetchCurrentPage, mutateEditingMarkdown, setCurrentPageId from deps to prevent infinite loop
  // They are stable functions and don't need to be in dependencies
  // Use currentPage?.path instead of currentPage to be more specific
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentPathname, pageId, currentPage?.path]);
};
