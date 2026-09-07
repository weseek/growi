import { CHAT_INTEGRATION_PEER_PREFIX } from '../../features/chat-integration/server/consts';

export default [
  /^\/api-docs\//,
  // The chat-integration proxy endpoints are machine-to-machine: they carry no
  // cookie and never read a session, yet the app-wide session is configured
  // with `saveUninitialized`, so a session document would be written for every
  // request -- including the ones the unsigned pairing-challenge endpoint
  // rejects for exceeding its attempt limit.
  // `(\/|$)` keeps the match on path segments, the same way
  // `app.use(CHAT_INTEGRATION_PEER_PREFIX, ...)` in crowi/express-init.js does:
  // the bare prefix and anything below it match, a similar-looking sibling
  // such as `/peering` does not.
  new RegExp(`^${CHAT_INTEGRATION_PEER_PREFIX}(\\/|$)`),
];
