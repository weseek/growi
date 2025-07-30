/**
 * Page state management - Public API
 *
 * This module provides a clean interface for page state management,
 * hiding internal implementation details while exposing only the necessary hooks.
 */

// Core page state hooks
export {
  useCurrentPageId,
  useCurrentPageData,
  useCurrentPagePath,
  usePageNotFound,
  useLatestRevision,
  useSetCurrentPage,
  // Remote revision hooks (replacements for stores/remote-latest-page.ts)
  useRemoteRevisionId,
  useRemoteRevisionBody,
  useRemoteRevisionLastUpdateUser,
  useRemoteRevisionLastUpdatedAt,
  useIsTrashPage,
  useIsRevisionOutdated,
} from './hooks';

// Data fetching hooks
export {
  usePageFetcher,
} from './page-fetcher';

// Re-export types that external consumers might need
export type { UseAtom } from '../ui/helper';
