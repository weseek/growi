import { pagePathUtils } from '@growi/core/dist/utils';
import { useAtomValue } from 'jotai';

import { useCurrentPathname } from '../global';

import {
  currentPageDataAtom,
  currentPageIdAtom,
  currentPagePathAtom,
  isRevisionOutdatedAtom,
  isTrashPageAtom,
  latestRevisionAtom,
  pageNotCreatableAtom,
  pageNotFoundAtom,
  redirectFromAtom,
  remoteRevisionBodyAtom,
  remoteRevisionIdAtom,
  remoteRevisionLastUpdatedAtAtom,
  remoteRevisionLastUpdateUserAtom,
  shareLinkIdAtom,
  templateBodyAtom,
  templateTagsAtom,
} from './internal-atoms';

/**
 * Public hooks for page state management
 * These provide a clean interface while hiding internal atom implementation
 */

// Read-only hooks for page state
export const useCurrentPageId = () => useAtomValue(currentPageIdAtom);

export const useCurrentPageData = () => useAtomValue(currentPageDataAtom);

export const usePageNotFound = () => useAtomValue(pageNotFoundAtom);

export const usePageNotCreatable = () => useAtomValue(pageNotCreatableAtom);

export const useLatestRevision = () => useAtomValue(latestRevisionAtom);

export const useShareLinkId = () => useAtomValue(shareLinkIdAtom);

export const useTemplateTags = () => useAtomValue(templateTagsAtom);

export const useTemplateBody = () => useAtomValue(templateBodyAtom);

// Remote revision hooks (replacements for stores/remote-latest-page.ts)
export const useRemoteRevisionId = () => useAtomValue(remoteRevisionIdAtom);

export const useRemoteRevisionBody = () => useAtomValue(remoteRevisionBodyAtom);

export const useRemoteRevisionLastUpdateUser = () =>
  useAtomValue(remoteRevisionLastUpdateUserAtom);

export const useRemoteRevisionLastUpdatedAt = () =>
  useAtomValue(remoteRevisionLastUpdatedAtAtom);

export const useRedirectFrom = () => useAtomValue(redirectFromAtom);

// Enhanced computed hooks (pure Jotai - no SWR needed)

/**
 * Get current page path with fallback to pathname
 * Pure Jotai replacement for stores/page.tsx useCurrentPagePath
 */
export const useCurrentPagePath = (): string | undefined => {
  const currentPagePath = useAtomValue(currentPagePathAtom);
  const currentPathname = useCurrentPathname();

  if (currentPagePath != null) {
    return currentPagePath;
  }
  if (currentPathname != null && !pagePathUtils.isPermalink(currentPathname)) {
    return currentPathname;
  }
  return undefined;
};

/**
 * Check if current page is in trash
 * Pure Jotai replacement for stores/page.tsx useIsTrashPage
 */
export const useIsTrashPage = (): boolean => useAtomValue(isTrashPageAtom);

/**
 * Check if current revision is outdated
 * Pure Jotai replacement for stores/page.tsx useIsRevisionOutdated
 */
export const useIsRevisionOutdated = (): boolean =>
  useAtomValue(isRevisionOutdatedAtom);
