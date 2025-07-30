import type { IPagePopulatedToShowRevision, IUserHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useAtom } from 'jotai';

import { useCurrentPathname } from '~/stores-universal/context';

import type { UseAtom } from '../ui/helper';

import {
  currentPageIdAtom,
  currentPageDataAtom,
  currentPagePathAtom,
  pageNotFoundAtom,
  latestRevisionAtom,
  setCurrentPageAtom,
  setPageStatusAtom,
  // New atoms for enhanced functionality
  remoteRevisionIdAtom,
  remoteRevisionBodyAtom,
  remoteRevisionLastUpdateUserAtom,
  remoteRevisionLastUpdatedAtAtom,
  setTemplateDataAtom,
  setRemoteRevisionDataAtom,
  isTrashPageAtom,
  isRevisionOutdatedAtom,
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

export const useLatestRevision = (): UseAtom<typeof latestRevisionAtom> => {
  return useAtom(latestRevisionAtom);
};

export const useCurrentPagePath = (): readonly [string | null, never] => {
  return useAtom(currentPagePathAtom);
};

// Write hooks for updating page state
export const useSetCurrentPage = (): ((page: IPagePopulatedToShowRevision | null) => void) => {
  return useAtom(setCurrentPageAtom)[1];
};

export const useSetPageStatus = (): ((status: { isNotFound?: boolean; isLatestRevision?: boolean }) => void) => {
  return useAtom(setPageStatusAtom)[1];
};

export const useSetTemplateData = (): ((data: { tags?: string[]; body?: string }) => void) => {
  return useAtom(setTemplateDataAtom)[1];
};

export const useSetRemoteRevisionData = (): ((data: {
  id?: string | null;
  body?: string | null;
  lastUpdateUser?: IUserHasId | null;
  lastUpdatedAt?: Date | null;
}) => void) => {
  return useAtom(setRemoteRevisionDataAtom)[1];
};

// Remote revision hooks (replacements for stores/remote-latest-page.ts)
export const useRemoteRevisionId = (): UseAtom<typeof remoteRevisionIdAtom> => {
  return useAtom(remoteRevisionIdAtom);
};

export const useRemoteRevisionBody = (): UseAtom<typeof remoteRevisionBodyAtom> => {
  return useAtom(remoteRevisionBodyAtom);
};

export const useRemoteRevisionLastUpdateUser = (): UseAtom<typeof remoteRevisionLastUpdateUserAtom> => {
  return useAtom(remoteRevisionLastUpdateUserAtom);
};

export const useRemoteRevisionLastUpdatedAt = (): UseAtom<typeof remoteRevisionLastUpdatedAtAtom> => {
  return useAtom(remoteRevisionLastUpdatedAtAtom);
};

// Enhanced computed hooks (pure Jotai - no SWR needed)

/**
 * Get current page path with fallback to pathname
 * Pure Jotai replacement for stores/page.tsx useCurrentPagePath
 */
export const useCurrentPagePathWithFallback = (): string | undefined => {
  const [currentPagePath] = useAtom(currentPagePathAtom);
  const { data: currentPathname } = useCurrentPathname();

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
