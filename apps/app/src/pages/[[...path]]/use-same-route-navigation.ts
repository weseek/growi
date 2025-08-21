import { useEffect, useRef, useMemo } from 'react';

import { useRouter } from 'next/router';


import {
  useCurrentPageData, useFetchCurrentPage, useCurrentPageId,
} from '~/states/page';
import { useEditingMarkdown } from '~/stores/editor';
import loggerFactory from '~/utils/logger';

import { extractPageIdFromPathname, isInitialProps, shouldFetchPage } from './navigation-utils';
import type { Props } from './types';

const logger = loggerFactory('growi:hooks:useSameRouteNavigation');

/**
 * Custom hook to calculate the target pathname for navigation
 * Memoizes the result to prevent unnecessary recalculations
 */
const useNavigationTarget = (router: ReturnType<typeof useRouter>, props: Props): string => {
  return useMemo(() => {
    // Use router.asPath for browser back/forward compatibility, fallback to props.currentPathname
    return router.asPath || props.currentPathname;
  }, [router.asPath, props.currentPathname]);
};

/**
 * Custom hook to check if initial data should be used
 * Memoizes the result to prevent unnecessary recalculations
 */
const useInitialDataCheck = (props: Props): boolean => {
  return useMemo(() => {
    // Skip if we have initial data and don't need to refetch
    const skipSSR = isInitialProps(props) ? props.skipSSR : false;
    return isInitialProps(props) && !skipSSR;
  }, [props]);
};

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

  // Use custom hooks for better separation of concerns
  const targetPathname = useNavigationTarget(router, props);
  const hasInitialData = useInitialDataCheck(props);

  // Track the last processed pathname to prevent unnecessary operations
  const lastProcessedPathnameRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Process pathname changes - monitor both props.currentPathname and router.asPath
  useEffect(() => {
    // Skip if we already processed this pathname
    if (lastProcessedPathnameRef.current === targetPathname) {
      return;
    }

    // Skip if we have initial data and don't need to refetch
    if (hasInitialData) {
      lastProcessedPathnameRef.current = targetPathname;
      return;
    }

    // Check if we need to fetch data
    const targetPageId = extractPageIdFromPathname(targetPathname);
    const currentPagePath = currentPage?.path;

    // Use extracted shouldFetchPage function
    const shouldFetch = shouldFetchPage({
      targetPageId,
      targetPathname,
      currentPageId: pageId,
      currentPagePath,
    });

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
        // Log error for debugging while preventing UI disruption
        logger.error('Navigation failed for pathname:', targetPathname, error);
        // Keep the last processed pathname to prevent retry loops
        lastProcessedPathnameRef.current = targetPathname;
      }
      finally {
        isFetchingRef.current = false;
      }
    };

    updatePageState();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetPathname, // Memoized value that includes both router.asPath and props.currentPathname
    hasInitialData, // Memoized value for initial data check
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);
};
