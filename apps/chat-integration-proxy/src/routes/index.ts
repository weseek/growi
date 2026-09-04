// Public barrel for `routes/` -- the outermost layer of the dependency order
// design.md declares (`types -> ... -> orchestration -> routes`), so nothing
// inside the app imports from here; the composition point in `runtime/` does.
//
// Opened by task 8.1 with the signature guard alone. The endpoints themselves
// (`growi-routes.ts`, `install-routes.ts`, `webhook-routes.ts`,
// `health-routes.ts`) are added by tasks 8.2-8.5 and belong here too.
//
// `INBOUND_OP_BY_PATH` is exported because the endpoints GROWI signs requests
// to have to be registered on exactly the paths it names -- reading the table
// is what keeps a route and the op its guard expects from drifting apart.
export type {
  InboundRequestContext,
  SignatureGuardDeps,
  SignedRequestEnv,
  SignedRequestVariables,
} from './signature-guard.js';
export { INBOUND_OP_BY_PATH, signatureGuard } from './signature-guard.js';
