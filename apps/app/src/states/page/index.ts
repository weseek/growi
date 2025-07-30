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
  useSetPageStatus,
  useSetTemplateData,
  useSetRemoteRevisionData,
  // Remote revision hooks (replacements for stores/remote-latest-page.ts)
  useRemoteRevisionId,
  useRemoteRevisionBody,
  useRemoteRevisionLastUpdateUser,
  useRemoteRevisionLastUpdatedAt,
  // Enhanced computed hooks (pure Jotai replacements for stores/page.tsx)
  useCurrentPagePathWithFallback,
  useIsTrashPage,
  useIsRevisionOutdated,
} from './hooks';

// Data fetching hooks
export {
  usePageFetcher,
  useInitializePageData,
} from './page-fetcher';

// Template data atoms (these need to be directly accessible for some use cases)
export {
  templateTagsAtom,
  templateContentAtom,
} from './internal-atoms';

// Re-export types that external consumers might need
export type { UseAtom } from '../ui/helper';
