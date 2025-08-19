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
    _extractPageIdFromPathname: (pathname: string) => string | null, // Legacy parameter for backward compatibility
    isInitialProps: (props: Props) => props is (InitialProps & SameRouteEachProps),
): void => {
  const router = useRouter();
  const [currentPage] = useCurrentPageData();
  const [pageId, setCurrentPageId] = useCurrentPageId();
  const { fetchCurrentPage } = useFetchCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  // Track the last processed pathname to prevent unnecessary operations
  const lastProcessedPathnameRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Process pathname changes - monitor both props.currentPathname and router.asPath
  useEffect(() => {
    // Use router.asPath for browser back/forward compatibility, fallback to props.currentPathname
    const targetPathname = router.asPath || props.currentPathname;

    // Always log when useEffect is triggered
    console.debug('useSameRouteNavigation useEffect triggered:', {
      targetPathname,
      lastProcessed: lastProcessedPathnameRef.current,
      timestamp: new Date().toISOString(),
    });

    // Skip if we already processed this pathname
    if (lastProcessedPathnameRef.current === targetPathname) {
      console.debug('Skipping - already processed:', targetPathname);
      return;
    }

    // Skip if we have initial data and don't need to refetch
    const skipSSR = isInitialProps(props) ? props.skipSSR : false;
    const hasInitialData = isInitialProps(props) && !skipSSR;

    if (hasInitialData) {
      console.debug('Skipping fetch - has initial data:', targetPathname);
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

    console.debug('shouldFetch decision:', {
      currentPagePath,
      targetPathname,
      targetPageId,
      pageId,
      condition1_noCurrentPage: !currentPagePath,
      condition2_differentPageId: (targetPageId != null && pageId != null && pageId !== targetPageId),
      condition3_differentPath: (currentPagePath !== targetPathname),
      finalDecision: shouldFetch,
    });

    if (!shouldFetch) {
      console.debug('No fetch needed for:', targetPathname);
      lastProcessedPathnameRef.current = targetPathname;
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.debug('Fetch already in progress, skipping:', targetPathname);
      return;
    }

    console.debug('Starting fetch for:', targetPathname, {
      currentPagePath,
      targetPageId,
      pageId,
    });

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

        console.debug('Page data fetched for:', targetPathname, !!pageData);

        // Update editing markdown if we have body content
        if (pageData?.revision?.body !== undefined) {
          mutateEditingMarkdown(pageData.revision.body);
        }

        // Mark as processed
        lastProcessedPathnameRef.current = targetPathname;
      }
      catch (error) {
        console.error('Error fetching page data for:', targetPathname, error);
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
