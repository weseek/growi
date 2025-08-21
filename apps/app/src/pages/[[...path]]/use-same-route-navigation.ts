import {
  useEffect, useRef, useMemo, useCallback,
} from 'react';

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
 * Uses router.asPath as the primary source of truth for current location
 */
const useNavigationTarget = (router: ReturnType<typeof useRouter>, props: Props): string => {
  return useMemo(() => {
    // Always prefer router.asPath for accurate browser state
    return router.asPath || props.currentPathname;
  }, [router.asPath, props.currentPathname]);
};

/**
 * Handles page state updates during navigation
 * Centralizes all page-related state management logic
 */
const usePageStateManager = () => {
  const [pageId, setCurrentPageId] = useCurrentPageId();
  const { fetchCurrentPage } = useFetchCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  const updatePageState = useCallback(async(targetPathname: string, targetPageId: string | null) => {
    try {
      // Clear current state for clean transition
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

      return true; // Success
    }
    catch (error) {
      logger.error('Navigation failed for pathname:', targetPathname, error);
      return false; // Failure
    }
  }, [setCurrentPageId, fetchCurrentPage, mutateEditingMarkdown]);

  return { pageId, updatePageState };
};

/**
 * Custom hook to check if initial data should be used
 */
const useInitialDataCheck = (props: Props): boolean => {
  return useMemo(() => {
    const skipSSR = isInitialProps(props) ? props.skipSSR : false;
    return isInitialProps(props) && !skipSSR;
  }, [props]);
};

/**
 * Custom hook for handling same-route navigation and fetching page data when needed
 * Optimized for minimal re-renders and efficient state updates using centralized navigation state
 */
export const useSameRouteNavigation = (props: Props): void => {
  const router = useRouter();
  const [currentPage] = useCurrentPageData();

  // Use custom hooks for better separation of concerns
  const targetPathname = useNavigationTarget(router, props);
  const hasInitialData = useInitialDataCheck(props);
  const { pageId, updatePageState } = usePageStateManager();

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

    const performNavigation = async(): Promise<void> => {
      await updatePageState(targetPathname, targetPageId);

      // Mark as processed regardless of success to prevent retry loops
      lastProcessedPathnameRef.current = targetPathname;
      isFetchingRef.current = false;
    };

    performNavigation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetPathname, // Memoized value that includes both router.asPath and props.currentPathname
    hasInitialData, // Memoized value for initial data check
    pageId, // Page ID changes
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);
};
