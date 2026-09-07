// Wires the 6 entry points the chat-integration proxy calls onto GROWI's
// existing apiv3 routing (design.md's op table under "口の一覧", task 3.5:
// "proxy から届く 6 つの口を既存の経路に登録する").
//
// This router's own job stops at wiring: attach `signatureGuard(op)`
// (task 3.2) in front of each of the 5 signed ops, and `pairingEndpoint`
// (task 3.4) in front of the one unsigned op. Four of the five signed
// handlers are placeholders -- their business logic belongs to later tasks
// (`command`: 5.x, `key-register-to-growi`/`key-revoke-to-growi`: 7.2,
// `account-link-start`: 6.1) -- see each handler's own comment for why its
// particular placeholder shape was chosen. `settings-pull` is the one
// exception: task 3.5's own text describes its behavior directly ("押し込
// みが届かなかったときに proxy が取りに来る保険。版と設定を返す"), so this
// file gives it real behavior now, backed by `chat_relations.settingsVersion`
// and `chat_channel_permissions` (task 1.2's models).
//
// **No handler here re-parses `req.body`.** `signatureGuard` already ran
// this op's own contract-check function over the verified bytes and
// attached the typed result to `req.chatPeer.body` -- reading `req.body`
// again (or calling `JSON.parse` on it again) would either read the raw
// `Buffer` past the point it is trusted for shape, or duplicate a parse
// that already happened (tasks.md Implementation Notes, task 3.5 note).

import {
  type AccountLinkStartResponse,
  type CommandResponse,
  type KeyOperationResult,
  OP_ENDPOINTS,
  OP_NAMES,
  RESPONSE_KINDS,
  type RelationSettings,
  type SettingsPullResponse,
} from '@growi/chat';
import type { RequestHandler, Router } from 'express';
import express from 'express';

import { ChatRelation } from '../models/chat-relation';
import { pairingEndpoint } from '../pairing/pairing-endpoint';
import { ChatChannelPermission } from '../settings/models/chat-channel-permission';
import {
  type InboundPeerOp,
  signatureGuard,
  type VerifiedPeerRequest,
} from '../signature-guard';

/**
 * Every `OP_ENDPOINTS` path template for an op this GROWI serves is of the
 * form `{growiUri}/_api/v3/chat-integration/peer/...`. Deriving each route's
 * path from that table (rather than writing the suffix a second time by
 * hand) is what keeps this router's mount points from drifting away from
 * `OP_ENDPOINTS` -- the single source of truth `signature-guard.ts` already
 * builds its own op vocabulary from (design constraint: reuse `OP_ENDPOINTS`,
 * don't hand-write paths that could disagree with it).
 */
const GROWI_FEATURE_BASE_TEMPLATE = '{growiUri}/_api/v3/chat-integration';

const routerPathFor = (op: InboundPeerOp): string => {
  const { pathTemplate } = OP_ENDPOINTS[op];
  if (!pathTemplate.startsWith(GROWI_FEATURE_BASE_TEMPLATE)) {
    // A wiring mistake, not a runtime condition -- fail while routes are
    // being registered (mirrors `signatureGuard`'s own throw for the same
    // class of mistake), rather than silently mounting the wrong path.
    throw new Error(
      `peer-router: OP_ENDPOINTS['${op}'].pathTemplate ('${pathTemplate}') does not start with '${GROWI_FEATURE_BASE_TEMPLATE}'`,
    );
  }
  return pathTemplate.slice(GROWI_FEATURE_BASE_TEMPLATE.length);
};

/**
 * The one entry point with no row in `OP_ENDPOINTS` -- by design, the table
 * deliberately omits both unsigned entry points (op-names.ts's own comment:
 * "The two unsigned entry points ... are deliberately absent. Both run
 * before any key exists, so they carry no `relationId`, no `op`, and no
 * signature."). design.md's op table (line 618) names this exact path.
 */
const PAIRING_CHALLENGE_PATH = '/peer/pairing/challenge';

/**
 * Placeholder for `command` (real behavior: task 5.x). A `help` response
 * with an empty command list is a genuinely valid `CommandResponse` -- it
 * says "here is the list of commands available", which is honestly empty
 * right now, rather than fabricating search/page-creation results this
 * endpoint cannot yet produce.
 */
const commandPlaceholderHandler: RequestHandler = (_req, res) => {
  const body: CommandResponse = {
    kind: RESPONSE_KINDS.help,
    commands: [],
  };
  res.status(200).json(body);
};

/**
 * Placeholder for `key-register-to-growi` / `key-revoke-to-growi` (real
 * behavior: task 7.2). `{ status: 'ok' }` is the minimal valid
 * `KeyOperationResult` shape -- it proves the request reached a real
 * handler past `signatureGuard`, without claiming a specific rejection
 * reason that would not yet be backed by any actual key-store check.
 */
const keyOperationPlaceholderHandler: RequestHandler = (_req, res) => {
  const body: KeyOperationResult = { status: 'ok' };
  res.status(200).json(body);
};

/**
 * Placeholder for `account-link-start` (real behavior: task 6.1).
 * `already-linked` with an empty `growiUserName` is chosen over
 * `link-issued` deliberately: a `link-issued` placeholder would have to
 * fabricate a `linkUrl`/`expiresAt` that looks like a real, followable link
 * before any linking flow exists, which is a more actively misleading
 * placeholder than an obviously-empty display name.
 */
const accountLinkStartPlaceholderHandler: RequestHandler = (_req, res) => {
  const body: AccountLinkStartResponse = {
    status: 'already-linked',
    growiUserName: '',
  };
  res.status(200).json(body);
};

/**
 * `settings-pull` -- the one signed endpoint this task gives real behavior
 * (task 3.5's own text: "設定の取り出しは、押し込みが届かなかったときに
 * proxy が取りに来る保険である。版と設定を返す"). Reads
 * `chat_relations.settingsVersion` and `chat_channel_permissions` for the
 * relation the signature proved this request is about, and returns them
 * verbatim as a `SettingsPullResponse` -- no 'all'/'none' encoding decision
 * is made here; each stored row's `allowedChannels` (a plain `string[]`)
 * already satisfies `RelationSettings.channelPermissions[].allowedChannels`
 * (`ReadonlyArray<string> | 'all' | 'none'`) without translation.
 */
const settingsPullHandler: RequestHandler = async (req, res) => {
  const { chatPeer } = req as VerifiedPeerRequest<typeof OP_NAMES.settingsPull>;
  const { relationId } = chatPeer.body;

  const relation = await ChatRelation.findOne({ relationId }).lean();
  if (relation == null) {
    // Unreachable in practice -- `signatureGuard`'s `resolvePeerKey` only
    // resolves a key for a relation that exists, and `acceptEnvelope`
    // already confirmed this body's `relationId` matches the verified key's
    // relation. Still answered safely rather than crashing into a 500.
    res.status(404).end();
    return;
  }

  const permissionRows = await ChatChannelPermission.find({
    relationId,
  }).lean();

  const channelPermissions: RelationSettings['channelPermissions'] =
    permissionRows.map((row) => ({
      commandName: row.commandName,
      allowedChannels: row.allowedChannels,
    }));

  const body: SettingsPullResponse = {
    settings: { relationId, channelPermissions },
    version: relation.settingsVersion,
  };
  res.status(200).json(body);
};

/**
 * The 6 endpoints, wired in production (no dependency overrides -- both
 * `signatureGuard` and `pairingEndpoint` already default to their real,
 * DB-backed dependencies).
 */
export const createPeerRouter = (): Router => {
  const router = express.Router();

  router.post(
    routerPathFor(OP_NAMES.command),
    signatureGuard(OP_NAMES.command),
    commandPlaceholderHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.keyRegisterToGrowi),
    signatureGuard(OP_NAMES.keyRegisterToGrowi),
    keyOperationPlaceholderHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.keyRevokeToGrowi),
    signatureGuard(OP_NAMES.keyRevokeToGrowi),
    keyOperationPlaceholderHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.settingsPull),
    signatureGuard(OP_NAMES.settingsPull),
    settingsPullHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.accountLinkStart),
    signatureGuard(OP_NAMES.accountLinkStart),
    accountLinkStartPlaceholderHandler,
  );
  // No signatureGuard: the one op design.md marks "署名: 不要" (op-names.ts's
  // own comment on why this path has no OP_ENDPOINTS row either).
  router.post(PAIRING_CHALLENGE_PATH, pairingEndpoint);

  return router;
};
