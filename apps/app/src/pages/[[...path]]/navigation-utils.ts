import { isPermalink } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';

/**
 * Optimized utility functions for navigation handling
 * Centralized logic to reduce code duplication and improve maintainability
 */

/**
 * Extract pageId from pathname efficiently
 * Returns null for non-permalink paths to optimize conditional checks
 */
export const extractPageIdFromPathname = (pathname: string): string | null => {
  return isPermalink(pathname) ? removeHeadingSlash(pathname) : null;
};

/**
 * Check if two paths represent the same page
 * Optimized for common comparison scenarios
 */
export const isSamePage = (pathA?: string | null, pathB?: string | null): boolean => {
  if (!pathA || !pathB) return false;
  return pathA === pathB;
};

/**
 * Batch state checker for navigation decisions
 * Combines multiple boolean checks into a single calculation
 */
export const createNavigationState = (params: {
  pageId?: string | null;
  currentPagePath?: string;
  targetPathname: string;
  targetPageId: string | null;
  hasInitialData: boolean;
  skipSSR: boolean;
}): {
  isPageIdMismatch: boolean;
  isPathMismatch: boolean;
  needsPathBasedFetch: boolean;
  shouldFetch: boolean;
} => {
  const {
    pageId, currentPagePath, targetPathname, targetPageId, hasInitialData, skipSSR,
  } = params;

  const isPageIdMismatch = pageId != null && targetPageId != null && pageId !== targetPageId;
  const isPathMismatch = pageId != null && targetPageId == null && currentPagePath !== targetPathname;
  const needsPathBasedFetch = targetPageId == null && !isPathMismatch
    && (skipSSR || !currentPagePath || currentPagePath !== targetPathname);

  return {
    isPageIdMismatch,
    isPathMismatch,
    needsPathBasedFetch,
    shouldFetch: !hasInitialData && (isPageIdMismatch || isPathMismatch || needsPathBasedFetch),
  };
};
