// Public surface of the "what GROWI sends out" layer (design.md's `content/`).
// The notification wording (task 4.5) is added here later.
//
// The two types are re-exported because the caller of `filterPagesForViewer`
// builds both of its inputs -- the actor it got from `resolveActor` and the
// candidate list it built from the search hits -- and so has to name them.

export { buildConversationPageBody } from './conversation-page';
export type { HelpCommandEntry } from './help-content';
export { buildHelpContent } from './help-content';
export type {
  LinkPreviewPageSource,
  LinkPreviewResult,
} from './link-preview-mapper';
export { buildLinkPreview } from './link-preview-mapper';
export type { PublicPageFilterSource } from './public-page-filter';
export { isPubliclyReadablePage } from './public-page-filter';
export type { SearchResultPageSource } from './search-result-mapper';
export { mapToSearchResultItems } from './search-result-mapper';
export type {
  PageCandidate,
  ViewerFilterActor,
} from './viewer-page-filter';
export {
  filterPagesForViewer,
  OVER_FETCH_FACTOR,
  overFetchCount,
} from './viewer-page-filter';
