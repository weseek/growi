// Public barrel for `routes/` -- the outermost layer of the dependency order
// design.md declares (`types -> ... -> orchestration -> routes`), so nothing
// inside the app imports from here; the composition point in `runtime/` does.
//
// Opened by task 8.1 with the signature guard alone. Task 8.2 added the
// notification and settings-push endpoints; the remaining ones
// (`install-routes.ts`, `webhook-routes.ts`, `health-routes.ts` and the rest
// of the GROWI-facing set) are added by tasks 8.3-8.5 and belong here too.
// Task 8.5 is where this layer's entry point is settled.
//
// `INBOUND_OP_BY_PATH` is exported because the endpoints GROWI signs requests
// to have to be registered on exactly the paths it names -- reading the table
// is what keeps a route and the op its guard expects from drifting apart.
export type { NotificationRoutesDeps } from './notification-routes.js';
export { registerNotificationRoutes } from './notification-routes.js';
export type {
  InboundRequestContext,
  SignatureGuardDeps,
  SignedRequestEnv,
  SignedRequestVariables,
} from './signature-guard.js';
export { INBOUND_OP_BY_PATH, signatureGuard } from './signature-guard.js';
