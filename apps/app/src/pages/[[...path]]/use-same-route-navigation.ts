import { useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';

import {
  useCurrentPageData, useFetchCurrentPage, useCurrentPageId,
} from '../../states/page';
import { useEditingMarkdown } from '../../stores/editor';

import { extractPageIdFromPathname } from './navigation-utils';
import type { Props, InitialProps, SameRouteEachProps } from './types';

/**
 * Custom hook for handling same-route navigation and fetching page data when needed
 * Optimized for minimal re-renders and efficient state updates using centralized navigation state
 */
export const useSameRouteNavigation = (
    props: Props,
): void => {
  const router = useRouter();
  const [currentPage] = useCurrentPageData();
  const [pageId, setCurrentPageId] = useCurrentPageId();
  const { fetchCurrentPage } = useFetchCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  // Track the last processed pathname to prevent unnecessary operations
  const lastProcessedPathnameRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Type guard to check if props are initial props
  const isInitialProps = (props: Props): props is (InitialProps & SameRouteEachProps) => {
    return 'isNextjsRoutingTypeInitial' in props && props.isNextjsRoutingTypeInitial;
  };

  // Process pathname changes - monitor both props.currentPathname and router.asPath
  useEffect(() => {
    // Use router.asPath for browser back/forward compatibility, fallback to props.currentPathname
    const targetPathname = router.asPath || props.currentPathname;

    // Skip if we already processed this pathname
    if (lastProcessedPathnameRef.current === targetPathname) {
      return;
    }

    // Skip if we have initial data and don't need to refetch
    const skipSSR = isInitialProps(props) ? props.skipSSR : false;
    const hasInitialData = isInitialProps(props) && !skipSSR;

    if (hasInitialData) {
      lastProcessedPathnameRef.current = targetPathname;
      return;
    }

    // Check if we need to fetch data
    const targetPageId = extractPageIdFromPathname(targetPathname);
    const currentPagePath = currentPage?.path;

    // Always fetch if:
    // 1. No current page data
    // 2. Different page ID (only if both are defined)
    // 3. Different path
    const shouldFetch = (
      !currentPagePath // No current page
      || (targetPageId != null && pageId != null && pageId !== targetPageId) // Different page ID (strict comparison)
      || (currentPagePath !== targetPathname) // Different path
    );

    if (!shouldFetch) {
      lastProcessedPathnameRef.current = targetPathname;
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    const updatePageState = async(): Promise<void> => {
      try {
        // Clear current state to ensure clean transition
        setCurrentPageId(undefined);

        // Set new pageId if available
        if (targetPageId) {
          setCurrentPageId(targetPageId);
        }

        // Fetch page data
        const pageData = await fetchCurrentPage(targetPathname);

        // Update editing markdown if we have body content
        if (pageData?.revision?.body !== undefined) {
          mutateEditingMarkdown(pageData.revision.body);
        }

        // Mark as processed
        lastProcessedPathnameRef.current = targetPathname;
      }
      catch (error) {
        // Silent error handling - errors are logged by the caller if needed
      }
      finally {
        isFetchingRef.current = false;
      }
    };

    updatePageState();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.currentPathname, // Always trigger on pathname change
    router.asPath, // Also trigger on browser back/forward navigation
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);
};
