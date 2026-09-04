// Public entry point of the `relation/` layer (design.md's File Structure
// Plan: 「この層の公開窓口」). Layers to the right of `relation/` import from
// here, never from the files below.

export type {
  ExcludedGrowi,
  GrowiSelector,
  GrowiSelectorDeps,
  SelectionOutcome,
  SelectionRequest,
} from './growi-selection.js';
export { createGrowiSelector } from './growi-selection.js';
export type {
  ConnectResult,
  GrowiHttpRequest,
  GrowiHttpResponse,
  GrowiUriRejectionReason,
  GrowiUriResolver,
  GrowiUriResolverDeps,
  PinnedConnection,
  ResolveAddresses,
  ResolvedAddress,
} from './growi-uri-resolver.js';
// `buildPinnedRequestOptions` is deliberately absent: it is how this layer
// builds one request, not something another layer calls.
export {
  createGrowiUriResolver,
  GrowiRequestTimeoutError,
} from './growi-uri-resolver.js';
export type {
  PairingService,
  PairingServiceDeps,
  SendChallenge,
} from './pairing-service.js';
export {
  createPairingService,
  MAX_LIVE_PAIRING_ORDERS,
  MAX_SUBMISSION_ATTEMPTS,
  PairingOrderLimitError,
  REGISTRATION_CODE_TTL_MS,
} from './pairing-service.js';
export type {
  RelationKeyService,
  RelationKeyServiceDeps,
} from './relation-key-service.js';
export { createRelationKeyService } from './relation-key-service.js';
