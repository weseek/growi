import { isPermalink } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';

import type { Props, InitialProps, SameRouteEachProps } from './types';

/**
 * Extract pageId from pathname efficiently
 * Returns null for non-permalink paths to optimize conditional checks
 */
export const extractPageIdFromPathname = (pathname: string): string | null => {
  return isPermalink(pathname) ? removeHeadingSlash(pathname) : null;
};
/**
 * Type guard to check if props are initial props
 * Returns true if props contain initial data from SSR
 */
export const isInitialProps = (props: Props): props is (InitialProps & SameRouteEachProps) => {
  return 'isNextjsRoutingTypeInitial' in props && props.isNextjsRoutingTypeInitial;
};
/**
 * Determines if page data should be fetched based on current state
 * Pure function with no side effects for better testability
 */
export interface ShouldFetchPageParams {
  targetPageId: string | null;
  targetPathname: string;
  currentPageId?: string | null;
  currentPagePath?: string | null;
}

export const shouldFetchPage = (params: ShouldFetchPageParams): boolean => {
  const {
    currentPagePath, targetPageId, currentPageId, targetPathname,
  } = params;

  // Always fetch if:
  // 1. No current page data
  // 2. Different page ID (only if both are defined)
  // 3. Different path
  return (
    !currentPagePath // No current page
    || (targetPageId != null && currentPageId != null && currentPageId !== targetPageId) // Different page ID (strict comparison)
    || (currentPagePath !== targetPathname) // Different path
  );
};
