import { isPermalink } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';

/**
 * Extract pageId from pathname efficiently
 * Returns null for non-permalink paths to optimize conditional checks
 */
export const extractPageIdFromPathname = (pathname: string): string | null => {
  return isPermalink(pathname) ? removeHeadingSlash(pathname) : null;
};
