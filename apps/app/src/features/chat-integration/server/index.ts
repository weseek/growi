import express from 'express';

/**
 * Chat Integration (Gen 2) feature — server entry point.
 *
 * This module is the single place from which every Mongoose model this
 * feature owns must be statically imported (never lazily, from inside a
 * request handler). GROWI registers a model's indexes the moment it is
 * `import`-ed — `mongoose.model()` runs at import time and there is no
 * `autoIndex: false` anywhere in this codebase — so a model that is only
 * reachable via a lazy/dynamic import has no index until the feature is
 * first used. This spec's `chat_account_links` composite unique index
 * (`(relationId, platform, accountId)`) enforces a correctness invariant
 * (requirement 7.4), so a window with no index is a window where a
 * duplicate account link can be created.
 *
 * `server/routes/apiv3/index.js` is loaded on every GROWI process start and
 * statically imports this file (see its `createChatIntegrationRouter`
 * import), so anything this file imports — directly or transitively — is
 * guaranteed to load before the application accepts traffic. This mirrors
 * `features/growi-vault/server/index.ts`.
 *
 * No models exist yet; they are added by later tasks in this spec and must
 * be imported from here.
 */
export const createChatIntegrationRouter = (): express.Router => {
  return express.Router();
};
