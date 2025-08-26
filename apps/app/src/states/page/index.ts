/**
 * Page state management - Public API
 *
 * This module provides a clean interface for page state management,
 * hiding internal implementation details while exposing only the necessary hooks.
 */

// Core page state hooks
export {
  useCurrentPageData,
  useCurrentPageId,
  useCurrentPagePath,
  useIsRevisionOutdated,
  useIsTrashPage,
  useLatestRevision,
  usePageNotCreatable,
  usePageNotFound,
  useRemoteRevisionBody,
  // Remote revision hooks (replacements for stores/remote-latest-page.ts)
  useRemoteRevisionId,
  useRemoteRevisionLastUpdatedAt,
  useRemoteRevisionLastUpdateUser,
  useTemplateBody,
  useTemplateTags,
} from './hooks';
export { useCurrentPageLoading } from './use-current-page-loading';
// Data fetching hooks
export { useFetchCurrentPage } from './use-fetch-current-page';
