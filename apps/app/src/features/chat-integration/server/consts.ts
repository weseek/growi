/**
 * The URL prefix under which every request coming *from* the chat-integration
 * proxy (machine-to-machine, signature-verified) is served.
 *
 * This is deliberately narrower than the feature's own base path
 * (`/_api/v3/chat-integration`): the admin-screen endpoints live directly
 * under that base path and must keep the app-wide JSON body parsing (and the
 * input validators that depend on it). Only the `/peer` sub-tree receives the
 * raw request bytes, because verifying `content-digest` requires the exact
 * bytes as they arrived -- see the design's
 * "署名の検証には届いたバイト列そのものが要る" section.
 *
 * Referenced from `server/crowi/express-init.js` (raw body parsing), and from
 * the feature's own router registration.
 */
export const CHAT_INTEGRATION_PEER_PREFIX = '/_api/v3/chat-integration/peer';
