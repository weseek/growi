import { pagePathUtils } from '@growi/core/dist/utils';
import { useAtom } from 'jotai';

import { useCurrentPathname } from '../global';
import type { UseAtom } from '../helper';

import {
  currentPageDataAtom,
  currentPageIdAtom,
  currentPagePathAtom,
  isRevisionOutdatedAtom,
  isTrashPageAtom,
  latestRevisionAtom,
  pageNotCreatableAtom,
  pageNotFoundAtom,
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
export const useCurrentPageId = (): UseAtom<typeof currentPageIdAtom> => {
  return useAtom(currentPageIdAtom);
};

export const useCurrentPageData = (): UseAtom<typeof currentPageDataAtom> => {
  return useAtom(currentPageDataAtom);
};

export const usePageNotFound = (): UseAtom<typeof pageNotFoundAtom> => {
  return useAtom(pageNotFoundAtom);
};

export const usePageNotCreatable = (): UseAtom<typeof pageNotCreatableAtom> => {
  return useAtom(pageNotCreatableAtom);
};

export const useLatestRevision = (): UseAtom<typeof latestRevisionAtom> => {
  return useAtom(latestRevisionAtom);
};

export const useShareLinkId = (): UseAtom<typeof shareLinkIdAtom> => {
  return useAtom(shareLinkIdAtom);
};

export const useTemplateTags = (): UseAtom<typeof templateTagsAtom> => {
  return useAtom(templateTagsAtom);
};

export const useTemplateBody = (): UseAtom<typeof templateBodyAtom> => {
  return useAtom(templateBodyAtom);
};

// Remote revision hooks (replacements for stores/remote-latest-page.ts)
export const useRemoteRevisionId = (): UseAtom<typeof remoteRevisionIdAtom> => {
  return useAtom(remoteRevisionIdAtom);
};

export const useRemoteRevisionBody = (): UseAtom<
  typeof remoteRevisionBodyAtom
> => {
  return useAtom(remoteRevisionBodyAtom);
};

export const useRemoteRevisionLastUpdateUser = (): UseAtom<
  typeof remoteRevisionLastUpdateUserAtom
> => {
  return useAtom(remoteRevisionLastUpdateUserAtom);
};

export const useRemoteRevisionLastUpdatedAt = (): UseAtom<
  typeof remoteRevisionLastUpdatedAtAtom
> => {
  return useAtom(remoteRevisionLastUpdatedAtAtom);
};

// Enhanced computed hooks (pure Jotai - no SWR needed)

/**
 * Get current page path with fallback to pathname
 * Pure Jotai replacement for stores/page.tsx useCurrentPagePath
 */
export const useCurrentPagePath = (): readonly [string | undefined] => {
  const [currentPagePath] = useAtom(currentPagePathAtom);
  const [currentPathname] = useCurrentPathname();

  if (currentPagePath != null) {
    return [currentPagePath];
  }
  if (currentPathname != null && !pagePathUtils.isPermalink(currentPathname)) {
    return [currentPathname];
  }
  return [undefined];
};

/**
 * Check if current page is in trash
 * Pure Jotai replacement for stores/page.tsx useIsTrashPage
 */
export const useIsTrashPage = (): readonly [boolean, never] => {
  return useAtom(isTrashPageAtom);
};

/**
 * Check if current revision is outdated
 * Pure Jotai replacement for stores/page.tsx useIsRevisionOutdated
 */
export const useIsRevisionOutdated = (): readonly [boolean, never] => {
  return useAtom(isRevisionOutdatedAtom);
};
