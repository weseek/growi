// Public surface of the "what GROWI sends out" layer (design.md's `content/`).
// Later tasks in this section add the notification wording, the search result
// mapper, the link preview mapper and the conversation page builder here.
//
// The two types are re-exported because the caller of `filterPagesForViewer`
// builds both of its inputs -- the actor it got from `resolveActor` and the
// candidate list it built from the search hits -- and so has to name them.

export type { PublicPageFilterSource } from './public-page-filter';
export { isPubliclyReadablePage } from './public-page-filter';
export type {
  PageCandidate,
  ViewerFilterActor,
} from './viewer-page-filter';
export {
  filterPagesForViewer,
  OVER_FETCH_FACTOR,
  overFetchCount,
} from './viewer-page-filter';
