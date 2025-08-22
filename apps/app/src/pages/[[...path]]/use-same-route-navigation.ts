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
    console.log('[NAV-DEBUG] updatePageState called:', {
      targetPathname,
      targetPageId,
      isRootPage: targetPathname === '/',
      timestamp: new Date().toISOString(),
    });

    try {
      // BACK TO ORIGINAL: Only update pageId if it actually changes
      const currentPageId = pageId;
      if (currentPageId !== targetPageId) {
        console.log('[NAV-DEBUG] Updating pageId:', { from: currentPageId, to: targetPageId });
        setCurrentPageId(targetPageId || undefined);
      }
      else {
        console.log('[NAV-DEBUG] PageId unchanged, skipping update');
      }

      // Fetch page data
      const fetchStartTime = performance.now();
      console.log('[NAV-DEBUG] Calling fetchCurrentPage with:', targetPathname, 'at', fetchStartTime, 'ms');
      const pageData = await fetchCurrentPage(targetPathname);
      const fetchEndTime = performance.now();
      console.log('[NAV-DEBUG] fetchCurrentPage completed in:', fetchEndTime - fetchStartTime, 'ms');

      // Update editing markdown if we have body content
      if (pageData?.revision?.body !== undefined) {
        const markdownUpdateStartTime = performance.now();
        console.log('[NAV-DEBUG] Updating editing markdown, body length:', pageData.revision.body.length);
        mutateEditingMarkdown(pageData.revision.body);
        const markdownUpdateEndTime = performance.now();
        console.log('[NAV-DEBUG] Markdown update completed in:', markdownUpdateEndTime - markdownUpdateStartTime, 'ms');
      }

      console.log('[NAV-DEBUG] Navigation successful for:', targetPathname);
      return true; // Success
    }
    catch (error) {
      logger.error('Navigation failed for pathname:', targetPathname, error);
      console.log('[NAV-DEBUG] Navigation failed:', { targetPathname, error });
      return false; // Failure
    }
  }, [pageId, setCurrentPageId, fetchCurrentPage, mutateEditingMarkdown]);

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
  const lastProcessedPageIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Process pathname changes - monitor both props.currentPathname and router.asPath
  useEffect(() => {
    const startTime = performance.now();
    console.log('[NAV-DEBUG] useEffect triggered:', {
      targetPathname,
      lastProcessedPathname: lastProcessedPathnameRef.current,
      hasInitialData,
      currentPageId: pageId,
      currentPagePath: currentPage?.path,
      isFetching: isFetchingRef.current,
      timestamp: new Date().toISOString(),
      performanceStart: startTime,
    });

    // Skip if we already processed this pathname
    if (lastProcessedPathnameRef.current === targetPathname) {
      console.log('[NAV-DEBUG] Skipping - already processed:', targetPathname);
      return;
    }

    // Skip if we have initial data and don't need to refetch
    if (hasInitialData) {
      console.log('[NAV-DEBUG] Skipping - has initial data');
      lastProcessedPathnameRef.current = targetPathname;
      return;
    }

    // Check if we need to fetch data
    const targetPageId = extractPageIdFromPathname(targetPathname);
    const currentPagePath = currentPage?.path;

    console.log('[NAV-DEBUG] Checking if should fetch:', {
      targetPageId,
      targetPathname,
      currentPageId: pageId,
      currentPagePath,
    });

    // Enhanced duplicate check: prevent navigation to same page by both pathname and pageId
    const isSamePathname = lastProcessedPathnameRef.current === targetPathname;
    const isSamePageId = targetPageId && lastProcessedPageIdRef.current === targetPageId;
    const isCurrentPageSame = pageId && pageId === targetPageId;

    if (isSamePathname || isSamePageId || isCurrentPageSame) {
      console.log('[NAV-DEBUG] Skipping - same page detected:', {
        isSamePathname,
        isSamePageId,
        isCurrentPageSame,
        lastProcessedPathname: lastProcessedPathnameRef.current,
        lastProcessedPageId: lastProcessedPageIdRef.current,
        currentPageId: pageId,
      });
      // Update tracking refs even when skipping
      lastProcessedPathnameRef.current = targetPathname;
      if (targetPageId) lastProcessedPageIdRef.current = targetPageId;
      return;
    }

    // Use extracted shouldFetchPage function
    const shouldFetch = shouldFetchPage({
      targetPageId,
      targetPathname,
      currentPageId: pageId,
      currentPagePath,
    });

    console.log('[NAV-DEBUG] shouldFetch result:', shouldFetch);

    if (!shouldFetch) {
      console.log('[NAV-DEBUG] Skipping - shouldFetch is false');
      lastProcessedPathnameRef.current = targetPathname;
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[NAV-DEBUG] Skipping - already fetching');
      return;
    }

    isFetchingRef.current = true;
    console.log('[NAV-DEBUG] Starting navigation for:', targetPathname, 'at', performance.now() - startTime, 'ms');

    const performNavigation = async(): Promise<void> => {
      const navigationStartTime = performance.now();
      await updatePageState(targetPathname, targetPageId);
      const navigationEndTime = performance.now();

      // Mark as processed regardless of success to prevent retry loops
      lastProcessedPathnameRef.current = targetPathname;
      if (targetPageId) lastProcessedPageIdRef.current = targetPageId;
      isFetchingRef.current = false;
      console.log('[NAV-DEBUG] Navigation completed for:', targetPathname, {
        navigationDuration: navigationEndTime - navigationStartTime,
        totalDuration: navigationEndTime - startTime,
        timestamp: new Date().toISOString(),
      });
    };

    performNavigation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetPathname, // Memoized value that includes both router.asPath and props.currentPathname
    hasInitialData, // Memoized value for initial data check
    // pageId removed to prevent infinite loops when fetchCurrentPage updates the pageId atom
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isFetchingRef.current = false;
    };
  }, []);
};
