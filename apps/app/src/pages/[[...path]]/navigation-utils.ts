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
