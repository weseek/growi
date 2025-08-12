import { useEffect, useMemo } from 'react';

import {
  useCurrentPageData, useFetchCurrentPage, useCurrentPageId,
} from '../../states/page';
import { useEditingMarkdown } from '../../stores/editor';

import { extractPageIdFromPathname, createNavigationState } from './navigation-utils';
import type { Props, InitialProps, SameRouteEachProps } from './types';

/**
 * Custom hook for handling same-route navigation and fetching page data when needed
 * Optimized for minimal re-renders and efficient state updates using centralized navigation state
 */
export const useSameRouteNavigation = (
    props: Props,
    _extractPageIdFromPathname: (pathname: string) => string | null, // Legacy parameter for backward compatibility
    isInitialProps: (props: Props) => props is (InitialProps & SameRouteEachProps),
): void => {
  const [currentPage] = useCurrentPageData();
  const [pageId, setCurrentPageId] = useCurrentPageId();
  const { fetchCurrentPage } = useFetchCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  // Memoize navigation state using centralized logic
  const navigationState = useMemo(() => {
    const targetPathname = props.currentPathname;
    const targetPageId = extractPageIdFromPathname(targetPathname);
    const skipSSR = isInitialProps(props) ? props.skipSSR : false;
    const hasInitialData = isInitialProps(props) && !skipSSR;

    return createNavigationState({
      pageId,
      currentPagePath: currentPage?.path,
      targetPathname,
      targetPageId,
      hasInitialData,
      skipSSR,
    });
  }, [props, isInitialProps, pageId, currentPage?.path]);

  // Handle same-route navigation with optimized batch operations
  useEffect(() => {
    if (!navigationState.shouldFetch) return;

    // Batch state updates for optimal performance
    const updatePageState = async(): Promise<void> => {
      const targetPageId = extractPageIdFromPathname(props.currentPathname);

      // Clear stale pageId atomically when needed
      if (navigationState.isPageIdMismatch || navigationState.isPathMismatch) {
        setCurrentPageId(undefined);
      }

      // Set new pageId if available
      if (targetPageId) {
        setCurrentPageId(targetPageId);
      }

      // Fetch and update page data
      const pageData = await fetchCurrentPage(props.currentPathname);
      if (pageData?.revision?.body !== undefined) {
        mutateEditingMarkdown(pageData.revision.body);
      }
    };

    updatePageState();
    // Stable functions from hooks are omitted from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationState.shouldFetch, navigationState.isPageIdMismatch, navigationState.isPathMismatch, props.currentPathname]);
};
