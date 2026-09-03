// Public entry point of the `relation/` layer (design.md's File Structure
// Plan: 「この層の公開窓口」). Layers to the right of `relation/` import from
// here, never from the files below.

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
